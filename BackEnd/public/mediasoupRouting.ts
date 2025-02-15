import http from "http";
import {Server} from "socket.io";
import mediasoup from "mediasoup";
import { Worker, Router, Producer, Consumer, WebRtcTransport } from "mediasoup/node/lib/types";

type Peer = {
    transports: WebRtcTransport[];
    producers: Producer[];
    consumers: Consumer[];
};

type TransportParams = {
    roomId: string,
    transportId: string;
    dtlsParameters: any;
};

type ProduceParams = {
    roomId: string,
    transportId: string;
    kind: "audio" | "video";
    rtpParameters: any;
};

type ConsumeParams = {
    producerId: string;
    rtpCapabilities: any;
    transportId: string;
};

const mediasoupFunctioning = (server: http.Server)=>{

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"]
        }
    });
    let worker: Worker, router: Router;

    (async () => {
        worker = await mediasoup.createWorker();
        router = await worker.createRouter({
            mediaCodecs: [
                { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
                { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }
            ]
        });
        console.log("Mediasoup router created.");
    })();
    
    const rooms = new Map<string, Map<string, Peer>>();
    
    io.on('connection', async (socket) => {
        console.log('New client connected:', socket.id);
    
        socket.on('startEvent', (roomId)=>{
            rooms.set(roomId, new Map<string, Peer>());
            console.log("Event started");
        })

        socket.on('joinRoom', (roomId, callback)=>{

            const room = rooms.get(roomId);

            if(!room){
                console.log('No room for received RoomId');
                return callback({error: "No room for received RoomId"});
            }
            room.set(socket.id, { transports: [], producers: [], consumers: [] });
            return callback({ success: true});
        })
    
        socket.on('getRouterRtpCapabilities', (callback: (data: any)=> void) => {
            if (!router) {
                console.error("🚨 Router not initialized yet.");
                return callback({ error: "Router not ready" });
            }
            console.log('Sending router RTP capabilities.');
            callback(router.rtpCapabilities);
        });
    
        socket.on('createTransport', async ({ roomId }, callback) => {
            console.log('Received createTransport event from client:', socket.id);
    
            const room  = rooms.get(roomId);
            if(!room){
                console.log("room not found while creating transport");
                return callback({error: "Room not found while creating transport"});
            }

            const peer = room.get(socket.id);

            if(!peer){
                console.log("Peer never joined the room");
                return callback({ error: "Peer not found" }); 
            }

            try {
                const transport = await router.createWebRtcTransport({
                    // listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
                    listenIps: [{ ip: '127.0.0.1'}],
                    enableUdp: true,
                    enableTcp: true,
                    preferUdp: true
                });
    
                console.log(`✅ Transport created: ${transport.id}`);

                peer.transports.push(transport);
    
                callback({
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters
                });
    
            } catch (error) {
                console.error('❌ Error creating transport:', error);
                callback({ error: (error as Error).message });
            }
        });
    
        socket.on('connectTransport', async ({ roomId, transportId, dtlsParameters }: TransportParams, callback: (data: any) => void) => {
            console.log('Received connectTransport event for transport:', transportId);
    
            try {
                const room  = rooms.get(roomId);
            if(!room){
                console.log("room not found while connecting transport");
                return callback({error: "Room not found while connecting transport"});
            }

            const peer = room.get(socket.id);

            if(!peer){
                console.log("Peer not find in the room");
                return callback({ error: "Peer not found" }); 
            }
    
                const transport = peer.transports.find(t => t.id === transportId);

                if (!transport) {
                    console.error("🚨 Transport not found:", transportId);
                    return callback({ error: "Transport not found" });
                }
    
                await transport.connect({ dtlsParameters });
                console.log(`✅ Transport connected: ${transportId}`);
    
                callback({ success: true });
    
            } catch (error) {
                console.error("❌ Error connecting transport:", error);
                callback({ error: (error as Error).message });
            }
        });
    
        socket.on('produce', async ({ roomId, transportId, kind, rtpParameters }: ProduceParams, callback: (data: any) => void) => {
            console.log('📡 Received produce event from client:', socket.id);
        
            try {
                const room  = rooms.get(roomId);
            if(!room){
                console.log("room not found while producing streams");
                return callback({error: "Room not found while producing streams"});
            }

            const peer = room.get(socket.id);

            if(!peer){
                console.log("Peer never joined the room");
                return callback({ error: "Peer not found" }); 
            }
        
                const transport = peer.transports.find(t => t.id === transportId);

                if (!transport) {
                    console.error("🚨 Transport not found for producing:", transportId);
                    return callback({ error: "Transport not found" });
                }
        
                const producer = await transport.produce({ kind, rtpParameters });
                peer.producers.push(producer);
                console.log(`✅ New producer created: ${producer.id} (${kind})`);
        
                callback({ id: producer.id });
        
                // Inform other clients that a new producer is available
                socket.to(roomId).emit('newProducer', { producerId: producer.id, kind });
                // console.log(`📢 Emitting newProducer event for producer: ${producer.id}`);
                // socket.broadcast.emit('newProducer', { producerId: producer.id, kind });
        
            } catch (error) {
                console.error('❌ Error producing stream:', error);
                callback({ error: (error as Error).message });
            }
        });
    
        socket.on("consume", async ({ roomId, producerId, rtpCapabilities, transportId }, callback) => {
            try {
                console.log(`🔄 ${socket.id} requesting to consume Producer ${producerId} in Room ${roomId}`);
        
                // Get the room and check if it exists
                const room = rooms.get(roomId);
                if (!room) {
                    console.error(`❌ Room not found: ${roomId}`);
                    return callback({ error: "Room not found" });
                }
        
                // Get the peer (user) who is requesting to consume
                const peer = room.get(socket.id);
                if (!peer) {
                    console.error(`🚨 Peer not found in room: ${roomId}`);
                    return callback({ error: "Peer not found" });
                }
        
                // Find the transport the user wants to consume on
                const transport = peer.transports.find(t => t.id === transportId);
                if (!transport) {
                    console.error(`🚨 Transport not found for consuming: ${transportId}`);
                    return callback({ error: "Transport not found" });
                }
        
                // Check if the router can consume this producer
                if (!router.canConsume({ producerId, rtpCapabilities })) {
                    console.error(`🚨 Cannot consume Producer: ${producerId} (unsupported capabilities)`);
                    return callback({ error: "Cannot consume" });
                }
        
                // Create a new consumer
                const consumer = await transport.consume({
                    producerId,
                    rtpCapabilities,
                    paused: true // Start paused, then resume after sending data to client
                });
        
                // Store consumer in peer
                peer.consumers.push(consumer);
                console.log(`✅ Consumer ${consumer.id} created for Producer ${producerId}`);
        
                // Send consumer details to the client
                callback({
                    id: consumer.id,
                    producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters
                });
        
                // Resume consumption
                await consumer.resume();
                console.log(`▶️ Consumer resumed: ${consumer.id}`);
        
            } catch (error) {
                console.error("❌ Error consuming stream:", error);
                callback({ error: (error as Error).message });
            }
        });
        
        // socket.on('disconnect', () => {
        //     console.log('🔴 Client disconnected:', socket.id);
        //     const peer = peers.get(socket.id);
        //     if (peer) {
        //         peer.transports.forEach(t => t.close());
        //         peer.producers.forEach(p => p.close());
        //         peer.consumers.forEach(c => c.close());
        //     }
        //     peers.delete(socket.id);
        // });
        socket.on("disconnect", () => {
            console.log(`🔴 Client disconnected: ${socket.id}`);
        
            // Find the room where this socket exists
            let roomIdToDelete: string | null = null;
        
            for (const [roomId, room] of rooms.entries()) {
                if (room.has(socket.id)) {
                    const peer = room.get(socket.id);
        
                    if (peer) {
                        console.log(`🧹 Cleaning up peer: ${socket.id} in Room: ${roomId}`);
        
                        // Close all transports, producers, and consumers
                        peer.transports.forEach(transport => transport.close());
                        peer.producers.forEach(producer => producer.close());
                        peer.consumers.forEach(consumer => consumer.close());
        
                        // Remove peer from the room
                        room.delete(socket.id);
        
                        // Notify remaining users in the room
                        socket.to(roomId).emit("peerDisconnected", { peerId: socket.id });
        
                        console.log(`❌ Peer ${socket.id} removed from Room: ${roomId}`);
                    }
        
                    // If the host disconnects, remove the entire room
                    if (room.size === 0) {
                        console.log(`🏚️ Room ${roomId} is now empty and will be deleted.`);
                        roomIdToDelete = roomId;
                    }
        
                    break; // Stop checking other rooms
                }
            }
        
            // Delete the room if necessary
            if (roomIdToDelete) {
                rooms.delete(roomIdToDelete);
            }
        });        
    });
}

export default mediasoupFunctioning;
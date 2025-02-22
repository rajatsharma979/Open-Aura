import http from "http";
import {Server} from "socket.io";
import mediasoup from "mediasoup";
import { Worker, Router, Producer, Consumer, WebRtcTransport } from "mediasoup/node/lib/types";

// type Peer = {
//     transports: WebRtcTransport[];
//     producers: Producer[];
//     consumers: Consumer[];
// };

// type TransportParams = {
//     roomId: string,
//     transportId: string;
//     dtlsParameters: any;
// };

// type ProduceParams = {
//     roomId: string,
//     transportId: string;
//     kind: "audio" | "video";
//     rtpParameters: any;
// };

// type ConsumeParams = {
//     producerId: string;
//     rtpCapabilities: any;
//     transportId: string;
// };

const mediasoupFunctioning = (server: http.Server, roomId: string)=>{

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
        console.log('🔧 Mediasoup Worker created');
        router = await worker.createRouter({
            mediaCodecs: [
                { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
                { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }
            ]
        });
        console.log("Mediasoup router created.");
    })();
    
    const rooms = new Map();
    
    io.on('connection', async (socket) => {
        console.log('New client connected:', socket.id);

        socket.on("startBroadcast", async (callback) => {
            try {

                if (rooms.has(roomId)) {
                    console.error(`❌ Room ${roomId} already exists`);
                    return callback({ error: "Room already exists" });
                }

                // const router = await worker.createRouter({
                //     mediaCodecs: [
                //         { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
                //         { kind: "video", mimeType: "video/vp8", clockRate: 90000 },
                //     ],
                // });

                // ✅ Create Room and Add Broadcaster
                rooms.set(roomId, {
                    router,
                    broadcasters: new Map(),
                    viewers: new Map(),
                    producers: new Map(),
                });

                // ✅ Ensure broadcaster joins the room
                socket.join(roomId);
                rooms.get(roomId).broadcasters.set(socket.id, socket);

                console.log(`🏠 Room ${roomId} created by ${socket.id}`);

                // 🔴 DEBUG: Verify broadcaster is inside the room
                const clients = await io.in(roomId).fetchSockets();
                console.log(`👥 Users in room ${roomId} after creation:`, clients.map(c => c.id));

                callback({ roomId });
            } catch (error) {
                console.error("❌ Error creating room:", error);
                callback({ error: "Failed to create room" });
            }
        });
    
        // socket.on('startEvent', (roomId)=>{
        //     rooms.set(roomId, new Map<string, Peer>());
        //     console.log("Event started");
        // })

        socket.on('joinRoom', async ({ roomId }, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    console.error(`❌ Room ${roomId} not found`);
                    return callback({ error: 'Room not found' });
                }
        
                room.viewers.set(socket.id, socket);
                socket.join(roomId);
        
                console.log(`🔵 ${socket.id} joined room ${roomId}`);
        
                // Send the list of existing producers to the joinee
                const existingProducers = Array.from(room.producers.values()).map((producer: any) => ({
                    producerId: producer.id,
                    kind: producer.kind,
                }));
        
                console.log(`📡 Sending existing producers to ${socket.id}:`, existingProducers);
                socket.emit('existingProducers', existingProducers);
        
                // 🔴 DEBUG: Show all users in the room
                const clients = await io.in(roomId).fetchSockets();
                console.log(`👥 Users in room ${roomId}:`, clients.map(c => c.id));
        
                callback({ success: true });
            } catch (error) {
                console.error("❌ Error joining room:", error);
                callback({ error: "Failed to join room" });
            }
        });

        // 🌍 Get Router Capabilities
        socket.on('getRouterRtpCapabilities', ({ roomId }, callback) => {
            const room = rooms.get(roomId);
            if (!room) {
                console.error(`❌ Room ${roomId} not found`);
                return callback({ error: 'Room not found' });
            }

            console.log(`📡 Sending router RTP capabilities for room ${roomId}`);
            callback(room.router.rtpCapabilities);
        });

        // 🚛 Create WebRTC Transport
        socket.on('createTransport', async ({ roomId, isProducer }, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    console.error(`❌ Room ${roomId} not found`);
                    return callback({ error: 'Room not found' });
                }

                console.log(`🛠 Creating ${isProducer ? 'send' : 'recv'} transport for room ${roomId}...`);

                const transport = await room.router.createWebRtcTransport({
                    listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
                    enableUdp: true,
                    enableTcp: true,
                    preferUdp: true,
                });

                console.log(`✅ Transport created: ${transport.id} (${isProducer ? 'send' : 'recv'})`);

                transport.on('dtlsstatechange', (state: any) => {
                    console.log(`🔗 DTLS state changed for transport ${transport.id}:`, state);
                    if (state === 'closed') transport.close();
                });

                // Store transport
                if (isProducer) {
                    room.broadcasters.set(socket.id, transport);
                } else {
                    room.viewers.set(socket.id, transport);
                }

                callback({
                    id: transport.id,
                    iceParameters: transport.iceParameters,
                    iceCandidates: transport.iceCandidates,
                    dtlsParameters: transport.dtlsParameters,
                });
            } catch (error) {
                console.error("❌ Error creating transport:", error);
                callback({ error: "Failed to create transport" });
            }
        });

        // 🔗 Connect WebRTC Transport
        socket.on('connectTransport', async ({ roomId, transportId, dtlsParameters }, callback) => {
            try {
                console.log(`🔗 Connecting transport ${transportId} in room ${roomId}...`);

                const room = rooms.get(roomId);
                if (!room) {
                    console.error(`❌ Room ${roomId} not found`);
                    return callback({ error: 'Room not found' });
                }

                const transport = [...room.broadcasters.values(), ...room.viewers.values()].find(t => t.id === transportId);
                if (!transport) {
                    console.error(`❌ Transport ${transportId} not found`);
                    return callback({ error: 'Transport not found' });
                }

                await transport.connect({ dtlsParameters });
                console.log(`✅ Transport ${transportId} connected`);

                callback({ success: true });
            } catch (error) {
                console.error("❌ Error connecting transport:", error);
                callback({ error: "Failed to connect transport" });
            }
        });

        // 🎙 Produce Media Stream
        socket.on('produce', async ({ roomId, transportId, kind, rtpParameters }, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    console.error(`❌ Room ${roomId} not found`);
                    return callback({ error: 'Room not found' });
                }
        
                const transport = [...room.broadcasters.values()].find(t => t.id === transportId);
                if (!transport) {
                    console.error(`❌ Transport ${transportId} not found`);
                    return callback({ error: 'Transport not found' });
                }
        
                const producer = await transport.produce({ kind, rtpParameters });
                room.producers.set(producer.id, producer);
        
                console.log(`🎥 Producer created: ${producer.id} (${kind}) in room ${roomId}`);
        
                // Notify all users in the room about the new producer
                io.to(roomId).emit('newProducer', { producerId: producer.id, kind });
                console.log(`📢 Emitted newProducer event for producer: ${producer.id}, kind: ${kind}`);
        
                callback({ producerId: producer.id });
            } catch (error) {
                console.error("❌ Error producing stream:", error);
                callback({ error: "Failed to produce stream" });
            }
        });

        // 👀 Consume Stream
        socket.on('consume', async ({ roomId, producerId, rtpCapabilities, transportId }, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    console.error(`❌ Room ${roomId} not found`);
                    return callback({ error: 'Room not found' });
                }

                const transport = [...room.viewers.values()].find(t => t.id === transportId);
                if (!transport) {
                    console.error(`❌ Transport ${transportId} not found`);
                    return callback({ error: 'Transport not found' });
                }

                const producer = room.producers.get(producerId);
                if (!producer) {
                    console.error(`❌ Producer ${producerId} not found`);
                    return callback({ error: 'Producer not found' });
                }

                if (!room.router.canConsume({ producerId: producer.id, rtpCapabilities })) {
                    console.error(`❌ Cannot consume producer ${producerId}`);
                    return callback({ error: 'Cannot consume' });
                }

                const consumer = await transport.consume({
                    producerId: producer.id,
                    rtpCapabilities,
                    paused: true,
                });

                console.log(`✅ Consumer created: ${consumer.id} for producer ${producerId}`);

                callback({
                    id: consumer.id,
                    producerId: consumer.producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                });

                await consumer.resume();
                console.log(`▶️ Consumer ${consumer.id} resumed`);
            } catch (error) {
                console.error("❌ Error consuming stream:", error);
                callback({ error: "Failed to consume stream" });
            }
        });

        // ❌ Handle Disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);

            for (const [roomId, room] of rooms.entries()) {
                // Remove broadcaster transports
                if (room.broadcasters.has(socket.id)) {
                    room.broadcasters.get(socket.id).close();
                    room.broadcasters.delete(socket.id);
                }

                // Remove viewers
                if (room.viewers.has(socket.id)) {
                    room.viewers.get(socket.id).close();
                    room.viewers.delete(socket.id);
                }

                // Remove empty rooms
                if (room.broadcasters.size === 0 && room.viewers.size === 0) {
                    rooms.delete(roomId);
                    console.log(`🗑 Room ${roomId} deleted`);
                }
            }
        });        
    });
}

export default mediasoupFunctioning;
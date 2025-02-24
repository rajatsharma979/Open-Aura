import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";

const VideoStreamingApp = () => {
    let [device, setDevice] = useState(null);
    const [sendTransport, setSendTransport] = useState(null);
    const [recvTransport, setRecvTransport] = useState(null);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [existingProducers, setExistingProducers] = useState([]);
    const socketRef = useRef(null);
    const myVideoRef = useRef(null);

    useEffect(() => {
        // Initialize Socket.IO connection
        socketRef.current = io("http://localhost:3000");

        socketRef.current.on("connect", () => {
            console.log("✅ Connected to server:", socketRef.current.id);
            
            setTimeout(() => {
                console.log("📢 Emitting startBroadcastStreaming");
                socketRef.current.emit('startBroadcastStreaming');
            }, 1000);
        });

        socketRef.current.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
        });

        socketRef.current.on("startBroadcasting", ()=>{
            console.log('Received startBroadcasting');
            startBroadcast();
        });
        // Listen for existing producers
        socketRef.current.on("existingProducers", (producers) => {
            console.log("📡 Received existing producers:", producers);
            setExistingProducers(producers);
        });

        // Cleanup on component unmount
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    // 🌍 Get Router Capabilities
    function getRouterCapabilities(roomId) {
        return new Promise((resolve, reject) => {
            socketRef.current.emit("getRouterRtpCapabilities", { roomId }, (rtpCapabilities) => {
                if (!rtpCapabilities) {
                    console.error("❌ Failed to fetch router capabilities");
                    reject("No RTP Capabilities received");
                    return;
                }

                try {
                    device = new mediasoupClient.Device();
                    device.load({ routerRtpCapabilities: rtpCapabilities })
                        .then(() => {
                            console.log("🎛 Router capabilities loaded:", device.rtpCapabilities);
                            setDevice(device);
                            resolve();
                        })
                        .catch((error) => {
                            console.error("❌ Failed to load device capabilities:", error);
                            reject(error);
                        });
                } catch (error) {
                    console.error("❌ Error loading device:", error);
                    reject(error);
                }
            });
        });
    };

    // 🚪 Join a Room (For Viewers)
    const joinRoom = async (roomId) => {
        return new Promise((resolve, reject) => {
            socketRef.current.emit("joinRoom", { roomId }, async (response) => {
                if (response.error) {
                    console.error("❌ Error joining room:", response.error);
                    reject(response.error);
                } else {
                    console.log('🔵 Joined Room: ${roomId}');
                    setCurrentRoomId(roomId);
                    await getRouterCapabilities(roomId);
                    resolve();
                }
            });
        });
    };

    // 🎥 Start Broadcasting Media
    async function startBroadcast() {

        try {
            // Step 1: Emit "startBroadcasting" to create a room
            const response = await new Promise((resolve, reject) => {
                socketRef.current.emit("startBroadcast", (response) => {
                    if (response.error) {
                        console.error("❌ Error starting broadcast:", response.error);
                        reject(response.error);
                    } else {
                        console.log('🏠 Broadcasting started! Room ID: ${response.roomId}');
                        setCurrentRoomId(response.roomId);
                        resolve(response);
                    }
                });
            });

            console.log(response.roomId);

            // Step 2: Initialize router capabilities for the room
            await getRouterCapabilities(response.roomId);

            // if (!device) {
            //     console.error("❌ Device not initialized");
            //     return;
            // }

            // Step 3: Get user media (audio and video)
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
            }

            // Step 4: Create a send transport
            console.log("🎥 Requesting send transport creation...");
            const transportParams = await new Promise((resolve, reject) => {
                socketRef.current.emit("createTransport", { roomId: response.roomId, isProducer: true }, (response) => {
                    if (!response || !response.id) {
                        console.error("❌ Invalid transport parameters received");
                        reject("Invalid transport parameters");
                    } else {
                        resolve(response);
                    }
                });
            });

            console.log("🚀 Send Transport params received:", transportParams);
            const newSendTransport = device.createSendTransport(transportParams);
            setSendTransport(newSendTransport);

            // Step 5: Set up transport event listeners
            newSendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
                console.log("🔗 Connecting send transport...");
                socketRef.current.emit("connectTransport", { roomId: response.roomId, transportId: newSendTransport.id, dtlsParameters }, (response) => {
                    if (response.error) {
                        console.error("❌ Error connecting transport:", response.error);
                        errback(response.error);
                    } else {
                        console.log("✅ Send transport connected!");
                        callback();
                    }
                });
            });

            newSendTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
                console.log('🎙 Producing ${kind} track...');
                socketRef.current.emit("produce", { roomId: response.roomId, transportId: newSendTransport.id, kind, rtpParameters }, (response) => {
                    if (response.error) {
                        errback(response.error);
                    } else {
                        callback({ id: response.producerId });
                    }
                });
            });

            // Step 6: Produce each track (audio and video)
            for (const track of stream.getTracks()) {
                await newSendTransport.produce({ track });
            }

            console.log("✅ Broadcasting started");
        } catch (error) {
            console.error("❌ Error in startBroadcast:", error);
        }
    };

    // 👀 Join an Event as Viewer
    const joinEvent = async (roomId) => {
        await joinRoom(roomId);

        if (!device) {
            console.error("❌ Device not initialized");
            return;
        }

        console.log("📡 Joining event...");
        console.log("🎥 Requesting receive transport creation...");
        socketRef.current.emit("createTransport", { roomId, isProducer: false }, async (transportParams) => {
            if (!transportParams || !transportParams.id) {
                console.error("❌ Invalid transport parameters received");
                return;
            }

            console.log("🚀 Receive Transport params received:", transportParams);
            const newRecvTransport = device.createRecvTransport(transportParams);
            setRecvTransport(newRecvTransport);

            newRecvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
                console.log("🔗 Connecting receive transport...");
                socketRef.current.emit("connectTransport", { roomId, transportId: newRecvTransport.id, dtlsParameters }, (response) => {
                    if (response.error) {
                        console.error("❌ Error connecting transport:", response.error);
                        errback(response.error);
                    } else {
                        console.log("✅ Receive transport connected!");
                        callback();
                    }
                });
            });

            // 🔹 Listen for new producers
            socketRef.current.on("newProducer", async ({ producerId, kind }) => {
                console.log('🎥 [NEW PRODUCER RECEIVED] ID: ${producerId}, Kind: ${kind}');
                await consumeStream(roomId, producerId);
            });

            console.log("📡 Ready to receive streams");
        });
    };

    // 🔥 Consume a Producer's Stream
    const consumeStream = async (roomId, producerId) => {
        if (!recvTransport) {
            console.error("❌ Receive transport not initialized");
            return;
        }

        console.log('📡 Requesting to consume producer: ${producerId}');

        socketRef.current.emit("consume", { roomId, producerId, rtpCapabilities: device.rtpCapabilities, transportId: recvTransport.id }, async (response) => {
            if (response.error) {
                console.error("❌ Error consuming stream:", response.error);
                return;
            }

            console.log("✅ Consuming stream response received:", response);

            try {
                const consumer = await recvTransport.consume({
                    id: response.id,
                    producerId: response.producerId,
                    kind: response.kind,
                    rtpParameters: response.rtpParameters,
                });

                console.log('✅ Successfully consumed ${response.kind} stream');

                // Create a media element for the stream
                const mediaElement = document.createElement(response.kind === "video" ? "video" : "audio");
                mediaElement.autoplay = true;
                mediaElement.playsInline = true;
                mediaElement.srcObject = new MediaStream([consumer.track]);
                document.body.appendChild(mediaElement);

                console.log('✅ ${response.kind} stream attached to DOM');
            } catch (error) {
                console.error("❌ Error consuming stream:", error);
            }
        });
    };

    return (
        <div>
            <h1>Video Streaming App</h1>
            <div>
                <video ref={myVideoRef} autoPlay playsInline muted />
            </div>
            <div>
                <button onClick={startBroadcast}>Start Broadcast</button>
                <button
                    onClick={async () => {
                        const roomId = prompt("Enter Room ID:");
                        if (roomId) await joinEvent(roomId);
                    }}
                >
                    Join Event
                </button>
            </div>
            <div>
                <h3>Existing Producers:</h3>
                <ul>
                    {existingProducers.map((producer) => (
                        <li key={producer.producerId}>
                            {producer.kind} - {producer.producerId}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default VideoStreamingApp;
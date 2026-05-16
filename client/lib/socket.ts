import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    // Prefer websocket but allow polling fallback for better compatibility
    transports: ["websocket", "polling"], 
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
});

// Debug logs
socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("connect_error", (err) => console.error("❌ Socket connection error:", err.message));
socket.on("disconnect", (reason) => console.warn("⚠️ Socket disconnected:", reason));

"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ChatTopBar from "@/components/chat/ChatTopBar";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";

import { socket } from "@/lib/socket";

export default function HackathonChatPage() {
    const { status } = useSession();
    const router = useRouter();
    const params = useParams();
    const hackathonId = params.id as string;

    const [messages, setMessages] = useState<any[]>([]);
    const [myId, setMyId] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [hackathonName, setHackathonName] = useState<string>("Community Chat");

    useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        api.get(`/api/users/me`).then((r) => setMyId(r.data.id)).catch(() => { });
        // Fetch hackathon details to get the name
        api.get(`/api/hackathons/joined`).then((r) => {
            const currentHackathon = r.data.find((h: any) => h.id === hackathonId);
            if (currentHackathon) {
                setHackathonName(currentHackathon.name);
            }
        }).catch(() => {});
    }, [status, hackathonId]);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/api/hackathons/${hackathonId}/messages`);
            setMessages(res.data);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (hackathonId && status === "authenticated" && myId) {
            fetchMessages();

            const roomId = `hackathon-${hackathonId}`;
            console.log("🔌 Initializing connection for hackathon room:", roomId);
            socket.io.opts.query = { matchId: roomId }; 
            socket.connect();

            const onConnect = () => {
                console.log("✅ Socket connected. Joining room:", roomId);
                setIsConnected(true);
                socket.emit("join-room", roomId);
            };

            const onDisconnect = () => {
                console.log("❌ Socket disconnected.");
                setIsConnected(false);
            };

            const onNewMessage = (newMsg: any) => {
                console.log("📩 New real-time message received:", newMsg);
                setMessages((prev) => {
                    if (prev.find(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
            };

            socket.on("connect", onConnect);
            socket.on("disconnect", onDisconnect);
            socket.on("new-message", onNewMessage);

            // If already connected when effect runs
            if (socket.connected) onConnect();

            return () => {
                console.log("🧹 Cleanup: removing listeners for room:", roomId);
                socket.off("connect", onConnect);
                socket.off("disconnect", onDisconnect);
                socket.off("new-message", onNewMessage);
                socket.disconnect();
            };
        }
    }, [hackathonId, status, myId]);

    const handleSend = async (text: string) => {
        try {
            await api.post(`/api/hackathons/${hackathonId}/messages`, { messageText: text });
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    if (status === "loading") return <LoadingSpinner />;

    return (
        <div className="chat-bg-dot" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
            <ChatTopBar title={`${hackathonName} Community`} matchId={hackathonId} />
            
            {/* Connection Status Indicator */}
            {!isConnected && (
                <div style={{ background: "rgba(232,97,74,0.1)", color: "#e8614a", fontSize: "0.7rem", textAlign: "center", padding: "0.25rem", borderBottom: "1px solid rgba(232,97,74,0.2)", zIndex: 10 }}>
                    Connecting to community chat...
                </div>
            )}
            {isConnected && (
                <div style={{ position: "absolute", top: "2.8rem", left: "4.8rem", zIndex: 100, display: "flex", alignItems: "center", gap: "6px" }}>
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} 
                    />
                    <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.02em" }}>LIVE</span>
                </div>
            )}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 680, margin: "0 auto", width: "100%" }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-secondary)" }}>
                        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</p>
                        <p>Welcome to the {hackathonName} community!</p>
                        <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Say hi to find teammates.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <MessageBubble
                        key={msg.id}
                        text={msg.messageText}
                        isMe={msg.sender.id === myId}
                        avatarUrl={msg.sender.avatarUrl}
                        username={msg.sender.username}
                        index={i}
                    />
                ))}
                <div ref={bottomRef} />
            </div>

            <ChatInput onSend={handleSend} />
        </div>
    );
}

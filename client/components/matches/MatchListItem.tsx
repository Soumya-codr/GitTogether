"use client";
import Link from "next/link";
import { motion } from "framer-motion";

interface MatchListItemProps {
    matchId: string;
    partner: { avatarUrl: string | null; username: string; name: string | null };
    lastMessage: { messageText: string } | null;
    compatibilityScore: number;
    index: number;
    onUnmatch?: () => void;
}

export default function MatchListItem({ matchId, partner, lastMessage, compatibilityScore, index, onUnmatch }: MatchListItemProps) {
    const handleUnmatch = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm(`Are you sure you want to unmatch with ${partner.name || partner.username}?`)) return;

        try {
            const api = (await import("@/lib/api")).default;
            await api.delete(`/api/matches/${matchId}`);
            onUnmatch?.();
        } catch (err) {
            console.error("Failed to unmatch:", err);
            alert("Could not unmatch. Please try again.");
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/chat/${matchId}`} style={{ textDecoration: "none" }}>
                <div
                    className="gt-card"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1.25rem",
                        padding: "1.25rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                >
                    <img
                        src={partner.avatarUrl || `https://ui-avatars.com/api/?name=${partner.username}\u0026background=242424\u0026color=FF6B9A`}
                        alt={partner.username}
                        style={{ 
                            width: 52, height: 52, 
                            borderRadius: "0.85rem", 
                            border: "1px solid var(--card-border)", 
                            flexShrink: 0,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
                        }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1rem", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {partner.name || partner.username}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lastMessage ? lastMessage.messageText : "Double tap to say hello!"}
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontWeight: 900, color: "var(--accent-pink)", fontSize: "1rem" }}>{Math.round(compatibilityScore)}%</p>
                            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", opacity: 0.5, letterSpacing: "0.05em" }}>match</p>
                        </div>
                        
                        <motion.button
                            onClick={handleUnmatch}
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                borderRadius: "0.6rem",
                                padding: "0.6rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s ease"
                            }}
                            title="Unmatch"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

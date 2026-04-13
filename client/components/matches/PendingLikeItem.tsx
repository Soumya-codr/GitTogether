"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const LANG_COLORS: Record<string, string> = {
    JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572a5",
    Go: "#00add8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
    Ruby: "#701516", Swift: "#fa7343", Kotlin: "#a97bff",
};

interface PendingLikeItemProps {
    targetId: string;
    swipeType: string;
    likedAt: string;
    user: {
        id: string; username: string; name: string | null;
        avatarUrl: string | null; primaryStack: any; bio: string | null;
    };
    onUndo: (targetId: string) => void;
    index: number;
}

export default function PendingLikeItem({ targetId, swipeType, likedAt, user, onUndo, index }: PendingLikeItemProps) {
    const [undoing, setUndoing] = useState(false);
    const stack = (user.primaryStack as string[]) || [];

    async function handleUndo() {
        setUndoing(true);
        try {
            await api.delete(`/api/swipes/pending?targetId=${targetId}`);
            onUndo(targetId);
        } catch {
            setUndoing(false);
        }
    }

    const timeAgo = () => {
        const diff = Date.now() - new Date(likedAt).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return `${mins}m ago`;
    };

    return (
        <AnimatePresence>
            {!undoing && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 1.25rem",
                        borderRadius: "1rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                >
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <img
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=111&color=fff`}
                            alt={user.username}
                            style={{ width: 52, height: 52, borderRadius: "0.75rem", border: "2px solid rgba(251,191,36,0.3)" }}
                        />
                        {/* Like type badge */}
                        <div style={{
                            position: "absolute", bottom: -4, right: -4,
                            width: 20, height: 20, borderRadius: "50%",
                            background: swipeType === "superlike" ? "#60a5fa" : "#fbbf24",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.6rem", border: "2px solid #1a1a1a",
                        }}>
                            {swipeType === "superlike" ? "⭐" : "♥"}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#eaeaea", truncate: true } as any}>
                                {user.name || user.username}
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "#555" }}>@{user.username}</p>
                        </div>
                        {/* Stack pills */}
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
                            {stack.slice(0, 4).map((lang: string) => (
                                <span key={lang} style={{
                                    fontSize: "0.65rem", fontWeight: 600,
                                    padding: "0.15rem 0.5rem", borderRadius: "999px",
                                    background: `${LANG_COLORS[lang] || "#888"}18`,
                                    color: LANG_COLORS[lang] || "#888",
                                    border: `1px solid ${LANG_COLORS[lang] || "#888"}35`,
                                }}>
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right side — time + undo */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.68rem", color: "#555" }}>{timeAgo()}</span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUndo}
                            style={{
                                fontSize: "0.72rem", fontWeight: 700,
                                padding: "0.35rem 0.75rem", borderRadius: "0.5rem",
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                color: "#ef4444", cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            ↩ Undo Like
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

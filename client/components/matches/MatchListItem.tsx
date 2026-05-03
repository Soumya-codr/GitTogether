"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import api from "@/lib/api";

interface MatchListItemProps {
    matchId: string;
    partner: { avatarUrl: string | null; username: string; name: string | null };
    lastMessage: { messageText: string } | null;
    compatibilityScore: number;
    index: number;
    onUnmatch?: () => void;
}

function getScoreColor(score: number): string {
    if (score >= 90) return "#22C55E";
    if (score >= 70) return "#F59E0B";
    return "#C026D3";
}

export default function MatchListItem({ matchId, partner, lastMessage, compatibilityScore, index, onUnmatch }: MatchListItemProps) {
    const scoreColor = getScoreColor(compatibilityScore);
    const roundedScore = Math.round(compatibilityScore);
    const [unmatching, setUnmatching] = useState(false);

    async function handleUnmatch(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setUnmatching(true);
        try {
            await api.delete(`/api/matches/${matchId}`);
            if (onUnmatch) onUnmatch();
        } catch {
            setUnmatching(false);
        }
    }

    return (
        <AnimatePresence>
            {!unmatching && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "0.9rem 1.1rem",
                            borderRadius: "var(--radius-xl)",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            transition: "all 0.2s ease",
                            position: "relative",
                            overflow: "hidden",
                            gap: "0.75rem",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--border-accent)";
                            e.currentTarget.style.background = "var(--bg-elevated)";
                            e.currentTarget.style.transform = "translateX(4px)";
                            e.currentTarget.style.boxShadow = "var(--glow-sm)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.background = "var(--bg-surface)";
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        {/* Left accent bar */}
                        <div style={{
                            position: "absolute", left: 0, top: "20%", bottom: "20%",
                            width: 2,
                            borderRadius: "0 2px 2px 0",
                            background: `linear-gradient(to bottom, ${scoreColor}, transparent)`,
                            opacity: 0.8,
                        }} />

                        <Link href={`/chat/${matchId}`} style={{ textDecoration: "none", flex: 1, display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
                            {/* Avatar with online dot */}
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <img
                                    src={partner.avatarUrl || `https://ui-avatars.com/api/?name=${partner.username}&background=161620&color=E879F9&size=80&bold=true`}
                                    alt={partner.username}
                                    style={{
                                        width: 50, height: 50,
                                        borderRadius: "50%",
                                        border: `2px solid ${scoreColor}40`,
                                        display: "block",
                                        objectFit: "cover",
                                    }}
                                />
                                <span style={{
                                    position: "absolute", bottom: 1, right: 1,
                                    width: 11, height: 11,
                                    background: "#22C55E",
                                    borderRadius: "50%",
                                    border: "2px solid var(--bg-surface)",
                                }} />
                            </div>

                            {/* Name + message */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    fontSize: "0.925rem",
                                    marginBottom: "0.2rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}>
                                    {partner.name || partner.username}
                                </p>
                                <p style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}>
                                    {lastMessage ? lastMessage.messageText : "Say hello! 👋"}
                                </p>
                            </div>

                            {/* Score */}
                            <div style={{
                                flexShrink: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: "0.2rem",
                            }}>
                                <span style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 800,
                                    color: scoreColor,
                                }}>
                                    {roundedScore}%
                                </span>
                                <span style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                }}>
                                    match
                                </span>
                            </div>
                        </Link>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUnmatch}
                            style={{
                                flexShrink: 0,
                                fontSize: "0.72rem", fontWeight: 700,
                                padding: "0.35rem 0.65rem", borderRadius: "0.5rem",
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                color: "#ef4444", cursor: "pointer",
                                marginLeft: "0.25rem",
                            }}
                        >
                            Unmatch
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

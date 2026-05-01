"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef } from "react";
import { MapPin, Heart, X } from "lucide-react";
import type { IntentConfig } from "@/lib/intentConfig";

interface Developer {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    primaryStack: string[];
    compatibilityScore: number;
    intentMode: string;
}

interface SwipeCardProps {
    developer: Developer;
    onSwipe: (id: string, type: "like" | "pass" | "superlike") => void;
    isTop: boolean;
    stackIndex: number;
    intentConfig?: IntentConfig;
}

const LANG_COLORS: Record<string, string> = {
    JavaScript: "#F7DF1E", TypeScript: "#3178C6", Python: "#3572A5",
    Go: "#00ADD8", Rust: "#DEA584", Java: "#B07219", "C++": "#F34B7D",
    Ruby: "#701516", Swift: "#FA7343", Kotlin: "#A97BFF",
    CSS: "#563D7C", HTML: "#E34C26", PHP: "#777BB4",
};

function getScoreColor(score: number): string {
    if (score >= 90) return "#22C55E";
    if (score >= 70) return "#F59E0B";
    return "#C026D3";
}

export function SwipeCard({ developer, onSwipe, isTop, stackIndex, intentConfig }: SwipeCardProps) {
    const likeLabel = intentConfig?.likeLabel || "CONNECT";
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-12, 12]);
    const likeOpacity = useTransform(x, [30, 110], [0, 1]);
    const passOpacity = useTransform(x, [-110, -30], [1, 0]);
    const cardRef = useRef<HTMLDivElement>(null);

    async function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
        const threshold = 110;
        if (info.offset.x > threshold) {
            await animate(x, 650, { duration: 0.28 });
            onSwipe(developer.id, "like");
        } else if (info.offset.x < -threshold) {
            await animate(x, -650, { duration: 0.28 });
            onSwipe(developer.id, "pass");
        } else {
            animate(x, 0, { type: "spring", stiffness: 350, damping: 28 });
        }
    }

    const scoreColor = getScoreColor(developer.compatibilityScore);

    return (
        <motion.div
            ref={cardRef}
            className="dev-card"
            style={{
                x, rotate,
                position: "absolute",
                width: "100%",
                height: "100%",
                top: `${stackIndex * 10}px`,
                scale: isTop ? 1 : 1 - stackIndex * 0.04,
                zIndex: 10 - stackIndex,
                cursor: isTop ? "grab" : "default",
                transformOrigin: "bottom center",
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: "grabbing" }}
        >
            {/* Like stamp */}
            {isTop && (
                <motion.div style={{
                    opacity: likeOpacity,
                    position: "absolute", top: 24, left: 20, zIndex: 20,
                    transform: "rotate(-18deg)",
                    border: "3px solid #22C55E",
                    color: "#22C55E",
                    fontWeight: 900, fontSize: "1.3rem",
                    padding: "0.2rem 0.9rem",
                    borderRadius: "var(--radius-md)",
                    pointerEvents: "none",
                    letterSpacing: "0.05em",
                    boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                    background: "rgba(34,197,94,0.08)",
                    backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                    <Heart size={16} fill="currentColor" />
                    {likeLabel}
                </motion.div>
            )}
            {/* Nope stamp */}
            {isTop && (
                <motion.div style={{
                    opacity: passOpacity,
                    position: "absolute", top: 24, right: 20, zIndex: 20,
                    transform: "rotate(18deg)",
                    border: "3px solid #EF4444",
                    color: "#EF4444",
                    fontWeight: 900, fontSize: "1.3rem",
                    padding: "0.2rem 0.9rem",
                    borderRadius: "var(--radius-md)",
                    pointerEvents: "none",
                    letterSpacing: "0.05em",
                    boxShadow: "0 0 20px rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.08)",
                    backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                    <X size={16} strokeWidth={2.5} />
                    NOPE
                </motion.div>
            )}

            {/* Card Content */}
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Hero image area */}
                <div style={{
                    position: "relative",
                    height: "55%",
                    flexShrink: 0,
                    overflow: "hidden",
                }}>
                    {/* Avatar as full-bleed image */}
                    <img
                        src={developer.avatarUrl || `https://ui-avatars.com/api/?name=${developer.username}&background=161620&color=E879F9&size=400&bold=true`}
                        alt={developer.username}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                    {/* Gradient overlay */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(9,9,14,0.95) 100%)",
                    }} />

                    {/* Match % badge */}
                    <div style={{
                        position: "absolute", top: 14, right: 14,
                        padding: "0.3rem 0.7rem",
                        borderRadius: "var(--radius-full)",
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(12px)",
                        border: `1px solid ${scoreColor}40`,
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        boxShadow: `0 0 12px ${scoreColor}30`,
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }} />
                        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: scoreColor }}>{developer.compatibilityScore}% Match</span>
                    </div>

                    {/* Location overlay on image */}
                    {developer.location && (
                        <div style={{
                            position: "absolute", bottom: 12, left: 14,
                            display: "flex", alignItems: "center", gap: "0.3rem",
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "0.78rem", fontWeight: 500,
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E", flexShrink: 0 }} />
                            <MapPin size={12} />
                            {developer.location}
                        </div>
                    )}
                </div>

                {/* Card body */}
                <div style={{
                    flex: 1,
                    padding: "1.1rem 1.25rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    overflow: "hidden",
                }}>
                    {/* Name & username */}
                    <div>
                        <h2 style={{
                            fontSize: "1.3rem",
                            fontWeight: 900,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                        }}>
                            {developer.name || developer.username}
                        </h2>
                        <p style={{ fontSize: "0.82rem", color: "var(--accent-light)", fontWeight: 600, marginTop: "0.15rem" }}>
                            @{developer.username}
                        </p>
                    </div>

                    {/* Bio */}
                    {developer.bio && (
                        <p style={{
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.55,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}>
                            {developer.bio}
                        </p>
                    )}

                    {/* Tech stack */}
                    {developer.primaryStack.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "auto" }}>
                            {developer.primaryStack.slice(0, 5).map((lang) => {
                                const color = LANG_COLORS[lang] || "#7E7D96";
                                return (
                                    <span key={lang} style={{
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        padding: "0.25rem 0.6rem",
                                        borderRadius: "var(--radius-full)",
                                        background: `${color}15`,
                                        color: color,
                                        border: `1px solid ${color}30`,
                                        display: "flex", alignItems: "center", gap: "0.3rem",
                                    }}>
                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
                                        {lang}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

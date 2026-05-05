"use client";

import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";

interface Hackathon {
    id: string;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string;
    mode: string;
    prizePool: string | null;
    themes: string[];
    techTags: string[];
    organizer: string | null;
    website: string | null;
    imageUrl: string | null;
    featured: boolean;
    interestedCount: number;
    hasJoined: boolean;
}

interface HackathonSwipeCardProps {
    hackathon: Hackathon;
    onSwipe: (id: string, type: "join" | "pass") => void;
    isTop: boolean;
    stackIndex: number;
}

const MODE_COLORS: Record<string, string> = {
    online: "#34d399",
    "in-person": "#f472b6",
    hybrid: "#a78bfa",
};

export function HackathonSwipeCard({ hackathon, onSwipe, isTop, stackIndex }: HackathonSwipeCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const controls = useAnimation();

    const [swipeDirection, setSwipeDirection] = useState<"join" | "pass" | null>(null);

    // FIX: Listen for remote swipe events (from buttons)
    useEffect(() => {
        if (!isTop) return;

        const handleRemoteSwipe = (e: any) => {
            const type = e.detail.type;
            if (type === 'join') {
                setSwipeDirection("join");
                controls.start({ x: 500, opacity: 0, rotate: 25, transition: { duration: 0.5 } })
                    .then(() => onSwipe(hackathon.id, "join"));
            } else if (type === 'pass') {
                setSwipeDirection("pass");
                controls.start({ x: -500, opacity: 0, rotate: -25, transition: { duration: 0.5 } })
                    .then(() => onSwipe(hackathon.id, "pass"));
            }
        };

        window.addEventListener('hackathon-swipe', handleRemoteSwipe);
        return () => window.removeEventListener('hackathon-swipe', handleRemoteSwipe);
    }, [isTop, controls, hackathon.id, onSwipe]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 100) {
            setSwipeDirection("join");
            controls.start({ x: 500, opacity: 0 }).then(() => onSwipe(hackathon.id, "join"));
        } else if (info.offset.x < -100) {
            setSwipeDirection("pass");
            controls.start({ x: -500, opacity: 0 }).then(() => onSwipe(hackathon.id, "pass"));
        } else {
            controls.start({ x: 0, rotate: 0 });
            setSwipeDirection(null);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    return (
        <motion.div
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={(e, info) => {
                if (info.offset.x > 50) setSwipeDirection("join");
                else if (info.offset.x < -50) setSwipeDirection("pass");
                else setSwipeDirection(null);
            }}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{
                x,
                rotate,
                opacity,
                position: "absolute",
                width: "100%",
                maxWidth: "380px",
                height: "540px",
                cursor: isTop ? "grab" : "default",
                zIndex: 100 - stackIndex,
                scale: 1 - stackIndex * 0.05,
                y: stackIndex * 15,
            }}
            whileTap={isTop ? { cursor: "grabbing" } : {}}
        >
            <div style={{
                height: "100%",
                background: "var(--bg-surface)",
                borderRadius: "2rem",
                border: hackathon.featured ? "2px solid #fbbf24" : "1px solid var(--border)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "var(--shadow-xl)",
                position: "relative"
            }}>
                {/* Visual indicator for swipe */}
                {swipeDirection && isTop && (
                    <div style={{
                        position: "absolute",
                        top: "2rem",
                        left: swipeDirection === "join" ? "2rem" : "auto",
                        right: swipeDirection === "pass" ? "2rem" : "auto",
                        padding: "0.5rem 1.5rem",
                        borderRadius: "1rem",
                        border: `4px solid ${swipeDirection === "join" ? "#fbbf24" : "#ef4444"}`,
                        color: swipeDirection === "join" ? "#fbbf24" : "#ef4444",
                        fontSize: "2rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        zIndex: 10,
                        transform: `rotate(${swipeDirection === "join" ? -15 : 15}deg)`,
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(4px)"
                    }}>
                        {swipeDirection === "join" ? "I'M IN!" : "NOPE"}
                    </div>
                )}

                {/* Top Section / Header */}
                <div style={{
                    padding: "1.75rem",
                    background: hackathon.featured ? "linear-gradient(135deg, rgba(251,191,36,0.1), transparent)" : "transparent",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "1rem",
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            background: `${MODE_COLORS[hackathon.mode]}20`,
                            color: MODE_COLORS[hackathon.mode],
                            textTransform: "uppercase"
                        }}>
                            {hackathon.mode}
                        </span>
                        {hackathon.featured && <span style={{ fontSize: "1.2rem" }}>⭐</span>}
                    </div>

                    <h2 style={{ fontSize: "1.75rem", fontWeight: 900, lineHeight: 1.1, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                        {hackathon.name}
                    </h2>
                    
                    <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.85rem", marginBottom: "1rem" }}>
                        {hackathon.prizePool ? `💰 ${hackathon.prizePool}` : "🏆 Eternal Glory"}
                    </p>

                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                        {hackathon.description}
                    </p>

                    {/* Meta info */}
                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            <span>📅</span>
                            <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            <span>👥</span>
                            <span>{hackathon.interestedCount} devs in community</span>
                        </div>
                        
                        {hackathon.website && (
                            <a 
                                href={hackathon.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    marginTop: "0.5rem",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "var(--accent-light)",
                                    textDecoration: "none",
                                    background: "rgba(255,255,255,0.05)",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "0.5rem",
                                    width: "fit-content",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    transition: "all 0.2s"
                                }}
                            >
                                🔗 Source Website
                            </a>
                        )}
                    </div>
                </div>

                {/* Tags Section */}
                <div style={{ padding: "1.25rem 1.75rem", background: "rgba(255,255,255,0.03)", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {hackathon.themes.slice(0, 3).map(t => (
                            <span key={t} style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "0.4rem", background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

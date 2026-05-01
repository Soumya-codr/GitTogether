"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

interface MatchPopupProps { visible: boolean; intentMode?: string; };

const MATCH_CONFIG: Record<string, { emoji: string; title: string; subtitle: string; color: string }> = {
    networking: { emoji: "🤝", title: "Connection Made!", subtitle: "A new professional connection awaits", color: "#60a5fa" },
    collab:     { emoji: "🛸", title: "Team Formed!", subtitle: "Time to ship something amazing together", color: "#a78bfa" },
    hackathon:  { emoji: "🏆", title: "Teammate Found!", subtitle: "Go build something legendary", color: "#fbbf24" },
    learning:   { emoji: "📚", title: "Study Buddy Found!", subtitle: "Time to level up together", color: "#34d399" },
    dating:     { emoji: "💝", title: "It's a GitTogether!", subtitle: "You both write beautiful code ❤️", color: "#f472b6" },
    casual:     { emoji: "🎮", title: "Vibe Match!", subtitle: "You're both weird in the same way!", color: "#e879f9" },
};

export default function MatchPopup({ visible, intentMode = "casual" }: MatchPopupProps) {
    const cfg = MATCH_CONFIG[intentMode] || MATCH_CONFIG.casual;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: "fixed", inset: 0, zIndex: 100,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(16px)",
                        padding: "2rem",
                    }}
                >
                    {/* Glow background */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "radial-gradient(ellipse at center, rgba(192,38,211,0.18) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    <motion.div
                        initial={{ scale: 0.7, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-accent)",
                            borderRadius: "var(--radius-2xl)",
                            padding: "2.5rem 2rem",
                            maxWidth: 360,
                            width: "100%",
                            textAlign: "center",
                            boxShadow: "0 0 60px var(--accent-glow), var(--shadow-xl)",
                            position: "relative",
                        }}
                    >
                        {/* Icon */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            style={{
                                width: 72, height: 72,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--accent), var(--accent-alt))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 1.5rem",
                                boxShadow: "0 0 32px var(--accent-glow)",
                            }}
                        >
                            <Heart size={32} fill="white" color="white" />
                        </motion.div>

                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            gap: "0.4rem", marginBottom: "0.75rem",
                            color: "var(--accent-light)",
                            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>
                            <Sparkles size={12} />
                            New Connection
                            <Sparkles size={12} />
                        </div>

                        <h2 style={{
                            fontSize: "1.8rem",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            background: "linear-gradient(135deg, var(--accent-light), var(--accent-alt))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "0.6rem",
                        }}>
                            It&apos;s a Match!
                        </h2>

                        <p style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                            lineHeight: 1.55,
                        }}>
                            You both swiped right. Start a conversation and build something great together.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

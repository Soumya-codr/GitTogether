"use client";
import { motion, AnimatePresence } from "framer-motion";

interface MatchPopupProps {
    visible: boolean;
    intentMode?: string;
}

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
                    initial={{ opacity: 0, scale: 0.6, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, y: -50 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{
                        position: "fixed",
                        top: "5.5rem",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 999,
                        padding: "1.5rem 2.5rem",
                        textAlign: "center",
                        background: "var(--bg-card)",
                        border: `1px solid ${cfg.color}50`,
                        borderRadius: "1.25rem",
                        boxShadow: `0 20px 60px ${cfg.color}30, 0 0 0 1px ${cfg.color}15`,
                        minWidth: "280px",
                    }}
                >
                    <motion.p
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}
                    >
                        {cfg.emoji}
                    </motion.p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 800, color: cfg.color }}>{cfg.title}</p>
                    <p style={{ fontSize: "0.82rem", color: "#888", marginTop: "0.3rem" }}>{cfg.subtitle}</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

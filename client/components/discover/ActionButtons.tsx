"use client";
import { motion } from "framer-motion";

interface ActionButtonsProps {
    onPass: () => void;
    onSuperLike: () => void;
    onLike: () => void;
    accentColor?: string;
    likeLabel?: string;
}

export default function ActionButtons({ onPass, onSuperLike, onLike, accentColor = "#e8614a", likeLabel }: ActionButtonsProps) {
    const glowColor = `${accentColor}40`;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {/* Pass / Nope */}
            <motion.button
                whileHover={{ scale: 1.12, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={onPass}
                style={{
                    width: 60, height: 60,
                    borderRadius: "50%",
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.06)",
                    color: "#ef4444",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(239,68,68,0.1)",
                    transition: "all 0.2s ease",
                }}
                title="Pass"
            >
                ✕
            </motion.button>

            {/* SuperLike */}
            <motion.button
                whileHover={{ scale: 1.12, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={onSuperLike}
                style={{
                    width: 48, height: 48,
                    borderRadius: "50%",
                    border: "1px solid rgba(96,165,250,0.35)",
                    background: "rgba(96,165,250,0.08)",
                    color: "#60a5fa",
                    fontSize: "1.15rem",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(96,165,250,0.1)",
                    transition: "all 0.2s ease",
                }}
                title="Super Like"
            >
                ⭐
            </motion.button>

            {/* Like — accent colored */}
            <motion.button
                whileHover={{ scale: 1.12, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={onLike}
                style={{
                    width: 64, height: 64,
                    borderRadius: "50%",
                    border: `1.5px solid ${accentColor}60`,
                    background: `${accentColor}12`,
                    color: accentColor,
                    fontSize: "1.6rem",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 25px ${glowColor}`,
                    transition: "all 0.2s ease",
                }}
                title={likeLabel || "Like"}
            >
                ♥
            </motion.button>
        </div>
    );
}

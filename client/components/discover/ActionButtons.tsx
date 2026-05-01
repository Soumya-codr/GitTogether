"use client";
import { motion } from "framer-motion";
import { X, Star, Heart } from "lucide-react";

interface ActionButtonsProps {
    onPass: () => void;
    onSuperLike: () => void;
    onLike: () => void;
    accentColor?: string;
}

export default function ActionButtons({ onPass, onSuperLike, onLike }: ActionButtonsProps) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
        }}>
            {/* Pass */}
            <motion.button
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.92 }}
                onClick={onPass}
                style={{
                    width: 58, height: 58,
                    borderRadius: "50%",
                    border: "1px solid rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.06)",
                    color: "rgba(239,68,68,0.7)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    transition: "all 0.2s ease",
                    backdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#EF4444";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                    e.currentTarget.style.boxShadow = "0 4px 24px rgba(239,68,68,0.25)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(239,68,68,0.7)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                }}
            >
                <X size={22} strokeWidth={2.5} />
            </motion.button>

            {/* SuperLike */}
            <motion.button
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.92 }}
                onClick={onSuperLike}
                style={{
                    width: 48, height: 48,
                    borderRadius: "50%",
                    border: "1px solid rgba(59,130,246,0.25)",
                    background: "rgba(59,130,246,0.06)",
                    color: "rgba(59,130,246,0.7)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    transition: "all 0.2s ease",
                    backdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#3B82F6";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(59,130,246,0.25)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(59,130,246,0.7)";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
                }}
            >
                <Star size={18} strokeWidth={2.5} />
            </motion.button>

            {/* Like */}
            <motion.button
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.92 }}
                onClick={onLike}
                style={{
                    width: 58, height: 58,
                    borderRadius: "50%",
                    border: "1px solid var(--border-accent)",
                    background: "linear-gradient(135deg, rgba(192,38,211,0.12), rgba(168,85,247,0.12))",
                    color: "var(--accent-light)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 24px var(--accent-glow)",
                    transition: "all 0.2s ease",
                    backdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(192,38,211,0.22), rgba(168,85,247,0.22))";
                    e.currentTarget.style.boxShadow = "0 4px 32px var(--accent-glow), 0 0 0 1px var(--border-accent)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(192,38,211,0.12), rgba(168,85,247,0.12))";
                    e.currentTarget.style.boxShadow = "0 4px 24px var(--accent-glow)";
                }}
            >
                <Heart size={22} strokeWidth={2.5} fill="currentColor" />
            </motion.button>
        </div>
    );
}

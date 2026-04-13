"use client";
import { motion } from "framer-motion";
import { INTENT_CONFIGS } from "@/lib/intentConfig";

interface IntentCardProps {
    id: string;
    selected: boolean;
    disabled: boolean;
    index: number;
    onSelect: (id: string) => void;
}

export default function IntentCard({ id, selected, disabled, index, onSelect }: IntentCardProps) {
    const cfg = INTENT_CONFIGS[id];
    if (!cfg) return null;

    const accent = cfg.accentColor;
    const glowColor = `${accent}35`;

    return (
        <motion.button
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.12, type: "spring", stiffness: 160, damping: 18 }}
            whileHover={{ scale: 1.04, y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(id)}
            disabled={disabled}
            style={{
                position: "relative",
                overflow: "hidden",
                background: selected
                    ? `linear-gradient(135deg, ${accent}20, ${accent}08)`
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${selected ? accent : "rgba(255,255,255,0.07)"}`,
                borderRadius: "1.25rem",
                padding: "1.75rem 1rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.6rem",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.25s ease",
                boxShadow: selected
                    ? `0 0 30px ${glowColor}, 0 8px 32px rgba(0,0,0,0.4)`
                    : "0 4px 20px rgba(0,0,0,0.3)",
                textAlign: "center",
            }}
        >
            {/* Glow blob behind emoji when selected */}
            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        position: "absolute",
                        top: "20%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Emoji */}
            <span style={{ fontSize: "2.6rem", filter: selected ? `drop-shadow(0 0 12px ${accent})` : "none", transition: "filter 0.3s ease", zIndex: 1 }}>
                {cfg.emoji}
            </span>

            {/* Label */}
            <span style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: selected ? accent : "var(--text-primary)",
                transition: "color 0.25s ease",
                zIndex: 1,
            }}>
                {cfg.label}
            </span>

            {/* Tagline */}
            <span style={{
                fontSize: "0.68rem",
                color: selected ? `${accent}cc` : "rgba(255,255,255,0.35)",
                lineHeight: 1.4,
                transition: "color 0.25s ease",
                zIndex: 1,
            }}>
                {cfg.tagline}
            </span>

            {/* Selected check indicator */}
            {selected && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        color: "#000",
                        fontWeight: 900,
                    }}
                >
                    ✓
                </motion.div>
            )}
        </motion.button>
    );
}

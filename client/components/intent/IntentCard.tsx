"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface IntentCardProps {
    id: string;
    emoji: string;
    label: string;
    description: string;
    selected: boolean;
    disabled: boolean;
    index: number;
    onSelect: (id: string) => void;
}

export default function IntentCard({ id, emoji, label, description, selected, disabled, index, onSelect }: IntentCardProps) {
    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
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
            <span className="ic-icon">{emoji}</span>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div className="ic-label">{label}</div>
                <div className="ic-desc">{description}</div>
            </div>
            {/* Checkmark */}
            <motion.div
                animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                    width: 22, height: 22,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent), var(--accent-alt))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 0 12px var(--accent-glow)",
                }}
            >
                <Check size={12} color="white" strokeWidth={3} />
            </motion.div>
        </motion.button>
    );
}

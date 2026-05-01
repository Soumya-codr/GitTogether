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
            className={`intent-card ${selected ? "selected" : ""}`}
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

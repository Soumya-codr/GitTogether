"use client";
import Link from "next/link";
import { motion } from "framer-motion";

interface EmptyStateProps {
    emoji: string;
    title: string;
    subtitle: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({ emoji, title, subtitle, actionLabel, actionHref, onAction }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "4rem 2rem",
                maxWidth: 420,
                margin: "0 auto",
                gap: "0",
            }}
        >
            {/* Floating emoji */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    fontSize: "4rem",
                    marginBottom: "1.5rem",
                    filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.3))",
                }}
            >
                {emoji}
            </motion.div>

            {/* Glow dot */}
            <div style={{
                width: 6, height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 12px var(--accent-glow)",
                marginBottom: "1rem",
            }} />

            <h3 style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: "0.6rem",
            }}>
                {title}
            </h3>

            <p style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                lineHeight: 1.65,
                marginBottom: "2rem",
            }}>
                {subtitle}
            </p>

            {actionLabel && (
                actionHref ? (
                    <Link href={actionHref} className="gt-btn-primary" style={{ width: "auto", padding: "0.7rem 2rem", textDecoration: "none" }}>
                        {actionLabel}
                    </Link>
                ) : (
                    <button onClick={onAction} className="gt-btn-primary" style={{ width: "auto", padding: "0.7rem 2rem" }}>
                        {actionLabel}
                    </button>
                )
            )}
        </motion.div>
    );
}

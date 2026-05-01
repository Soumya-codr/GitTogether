"use client";
import { motion } from "framer-motion";

export default function BrandHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
        >
            {/* Badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.3rem 0.9rem",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(192, 38, 211, 0.08)",
                    border: "1px solid var(--border-accent)",
                    color: "var(--accent-light)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: "1.25rem",
                }}
            >
                <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%", boxShadow: "0 0 8px var(--accent-glow)", display: "inline-block" }} />
                Developer Matchmaking Platform
            </motion.div>

            {/* Main heading */}
            <h1 style={{
                fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
                color: "var(--text-primary)",
            }}>
                Where developers{" "}
                <span style={{
                    background: "linear-gradient(135deg, var(--accent-light), var(--accent-alt))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                    connect
                </span>
                <br />through code
            </h1>

            {/* Subtitle */}
            <p style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                fontWeight: 500,
                lineHeight: 1.65,
                maxWidth: 480,
                margin: "0 auto 1.5rem",
            }}>
                Find your next pair-programming partner, open-source collaborator,
                or tech soulmate — matched by your GitHub DNA.
            </p>

            {/* Social proof */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
            }}>
                {[
                    { value: "2.4k+", label: "Developers" },
                    { value: "87%", label: "Match Rate" },
                    { value: "Open", label: "Source" },
                ].map(({ value, label }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

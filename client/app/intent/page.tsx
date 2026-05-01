"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import IntentGrid from "@/components/intent/IntentGrid";
import { INTENT_CONFIGS } from "@/lib/intentConfig";

export default function IntentPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedConfig = selected ? INTENT_CONFIGS[selected] : null;
    const bgColor = selectedConfig?.accentColor ?? "#FF6B9A";

    async function handleSelect(id: string) {
        if (loading) return;
        setSelected(id);
        setLoading(true);
        localStorage.setItem("gt_intent", id);
        // Minimum 1.5s delay so the portal animation is clearly visible
        const [, ] = await Promise.all([
            api.patch(`/api/users/me`, { intentMode: id }).catch(() => {}),
            new Promise(res => setTimeout(res, 1500)),
        ]);
        setLoading(false);
        router.push("/discover");
    }

    return (
        <main style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 1.5rem",
            background: "var(--bg-base)",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Background orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{ textAlign: "center", marginBottom: "2.5rem" }}
                >
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.3rem 0.9rem",
                        borderRadius: "var(--radius-full)",
                        background: "rgba(192, 38, 211, 0.08)",
                        border: "1px solid var(--border-accent)",
                        color: "var(--accent-light)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase" as const,
                        marginBottom: "1.1rem",
                    }}>
                        Step 1 of 1
                    </div>
                    <h1 style={{
                        fontSize: "clamp(1.9rem, 5vw, 2.6rem)",
                        fontWeight: 900,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.03em",
                        marginBottom: "0.6rem",
                        lineHeight: 1.1,
                    }}>
                        Choose your{" "}
                        <span style={{
                            background: "linear-gradient(135deg, var(--accent-light), var(--accent-alt))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            world
                        </span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.55 }}>
                        Each mode shapes who you meet and how you connect.
                    </p>
                </motion.div>

                <IntentGrid selected={selected} loading={loading} onSelect={handleSelect} />
            </div>
        </main>
    );
}

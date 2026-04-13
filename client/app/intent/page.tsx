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
            padding: "2.5rem 1.5rem",
            background: `radial-gradient(ellipse at 50% -10%, ${bgColor}18 0%, transparent 65%), var(--bg-main)`,
            transition: "background 0.5s ease",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Animated background orb that follows selected mode */}
            <AnimatePresence>
                {selectedConfig && (
                    <motion.div
                        key={selected}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{
                            position: "absolute",
                            top: "5%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 400,
                            height: 200,
                            borderRadius: "50%",
                            background: `radial-gradient(ellipse, ${selectedConfig.accentColor}25 0%, transparent 70%)`,
                            pointerEvents: "none",
                            filter: "blur(40px)",
                            zIndex: 0,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{ textAlign: "center", marginBottom: "2.5rem", position: "relative", zIndex: 1 }}
            >
                <motion.div
                    animate={{ color: selectedConfig?.accentColor ?? "var(--accent-pink)" }}
                    transition={{ duration: 0.4 }}
                    style={{ fontSize: "2.6rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}
                >
                    Choose Your World
                </motion.div>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.95rem", fontWeight: 500 }}>
                    Each mode is a different experience built just for you
                </p>

                {/* Active mode tagline */}
                <AnimatePresence mode="wait">
                    {selectedConfig && (
                        <motion.p
                            key={selected}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            style={{
                                marginTop: "0.75rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: selectedConfig.accentColor,
                            }}
                        >
                            {selectedConfig.emoji} {selectedConfig.tagline}
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>

            <IntentGrid selected={selected} loading={loading} onSelect={handleSelect} />

            {/* Loading overlay */}
            {loading && selected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: `radial-gradient(ellipse at center, ${INTENT_CONFIGS[selected]?.accentColor}20 0%, rgba(0,0,0,0.85) 100%)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1rem",
                        zIndex: 100,
                    }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.25, 0.95, 1.2, 1], rotate: [0, 12, -12, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                        style={{ fontSize: "5rem" }}
                    >
                        {INTENT_CONFIGS[selected]?.emoji}
                    </motion.div>
                    <p style={{ color: INTENT_CONFIGS[selected]?.accentColor, fontWeight: 700, fontSize: "1.1rem" }}>
                        Entering {INTENT_CONFIGS[selected]?.label}...
                    </p>
                </motion.div>
            )}
        </main>
    );
}

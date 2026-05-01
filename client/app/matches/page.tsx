"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Navbar from "@/components/shared/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import MatchListItem from "@/components/matches/MatchListItem";
import PendingLikeItem from "@/components/matches/PendingLikeItem";

export default function MatchesPage() {
    const { status } = useSession();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("matches");
    const [matches, setMatches] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"mutual" | "pending">("mutual");

    useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        api.get(`/api/matches`)
            .then((r) => setMatches(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [status]);

    if (loading) return <LoadingSpinner />;

    const TAB_STYLES = (active: boolean, accent: string) => ({
        padding: "0.55rem 1.25rem",
        borderRadius: "0.65rem",
        fontWeight: 700,
        fontSize: "0.85rem",
        cursor: "pointer",
        border: "none",
        background: active ? `${accent}18` : "transparent",
        color: active ? accent : "#666",
        borderBottom: active ? `2px solid ${accent}` : "2px solid transparent",
        transition: "all 0.2s ease",
    });

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
            <Navbar />

            <main style={{ flex: 1, maxWidth: 720, margin: "0 auto", width: "100%", padding: "2rem 1.25rem" }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: "1.75rem" }}
                >
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.4rem" }}>
                        <h1 style={{
                            fontSize: "1.75rem",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            background: "linear-gradient(135deg, var(--text-primary), var(--accent-light))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            Your GitMatches
                        </h1>
                        {matches.length > 0 && (
                            <span style={{
                                padding: "0.15rem 0.6rem",
                                borderRadius: "var(--radius-full)",
                                background: "rgba(192, 38, 211, 0.12)",
                                border: "1px solid var(--border-accent)",
                                color: "var(--accent-light)",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                            }}>
                                {matches.length}
                            </span>
                        )}
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {matches.length === 0 ? "No connections yet — go discover!" : `${matches.length} mutual connection${matches.length !== 1 ? "s" : ""} ready to chat`}
                    </p>
                </motion.div>

                {/* Tabs */}
                <div style={{
                    display: "flex",
                    gap: "0.25rem",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "0.3rem",
                    marginBottom: "1.25rem",
                    width: "fit-content",
                }}>
                    {(["mutual", "pending"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "0.45rem 1.1rem",
                                borderRadius: "var(--radius-md)",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.825rem",
                                fontWeight: 700,
                                fontFamily: "inherit",
                                transition: "all 0.2s ease",
                                background: activeTab === tab ? "linear-gradient(135deg, var(--accent), var(--accent-alt))" : "transparent",
                                color: activeTab === tab ? "white" : "var(--text-secondary)",
                                boxShadow: activeTab === tab ? "0 2px 12px var(--accent-glow)" : "none",
                            }}
                        >
                            {tab === "mutual" ? "Mutual Matches" : "Pending Likes"}
                        </button>
                    ))}
                </div>

                {/* Match list */}
                {matches.length === 0 ? (
                    <EmptyState
                        emoji="🔭"
                        title="No matches yet"
                        subtitle="Start swiping on the Discover page to find your first match."
                        actionLabel="Start Discovering"
                        actionHref="/discover"
                    />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {matches.map((m, i) => (
                            <MatchListItem
                                key={m.matchId}
                                matchId={m.matchId}
                                partner={m.partner}
                                lastMessage={m.lastMessage}
                                compatibilityScore={m.compatibilityScore}
                                index={i}
                                onUnmatch={() => setMatches(prev => prev.filter(item => item.matchId !== m.matchId))}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

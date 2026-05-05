"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import Navbar from "@/components/shared/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import MatchListItem from "@/components/matches/MatchListItem";
import PendingLikeItem from "@/components/matches/PendingLikeItem";

type Tab = "mutual" | "pending" | "hackathons";

export default function MatchesPage() {
    const { status } = useSession();
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("mutual");

    useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        Promise.all([
            api.get(`/api/matches`),
            api.get(`/api/swipes/pending`),
            api.get(`/api/hackathons/joined`)
        ])
        .then(([matchesRes, pendingRes, hackathonsRes]) => {
            setMatches(matchesRes.data || []);
            setPending(pendingRes.data || []);
            setHackathons(hackathonsRes.data || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, [status]);

    const handleLeaveHackathon = async (hackathonId: string) => {
        try {
            await api.delete(`/api/hackathons/${hackathonId}/leave`);
            setHackathons(prev => prev.filter(h => h.id !== hackathonId));
        } catch (err) {
            console.error("Failed to leave hackathon", err);
        }
    };

    if (loading) return <LoadingSpinner />;

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
                            Connections & Events
                        </h1>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        Manage your matches and the hackathons you&apos;ve joined.
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
                    marginBottom: "1.5rem",
                    width: "fit-content",
                }}>
                    {[
                        { id: "mutual", label: "Matches", color: "var(--accent)" },
                        { id: "pending", label: "Likes", color: "#3B82F6" },
                        { id: "hackathons", label: "Hackathons", color: "#fbbf24" },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as Tab)}
                            style={{
                                padding: "0.5rem 1.2rem",
                                borderRadius: "var(--radius-md)",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                fontFamily: "inherit",
                                transition: "all 0.2s ease",
                                background: activeTab === t.id ? (t.id === "hackathons" ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : "linear-gradient(135deg, var(--accent), var(--accent-alt))") : "transparent",
                                color: activeTab === t.id ? (t.id === "hackathons" ? "#000" : "white") : "var(--text-secondary)",
                                boxShadow: activeTab === t.id ? "0 2px 12px rgba(0,0,0,0.2)" : "none",
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content Sections */}
                <AnimatePresence mode="wait">
                    {activeTab === "mutual" && (
                        <motion.div
                            key="mutual"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
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
                        </motion.div>
                    )}

                    {activeTab === "pending" && (
                        <motion.div
                            key="pending"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {pending.length === 0 ? (
                                <EmptyState
                                    emoji="⏳"
                                    title="No pending likes"
                                    subtitle="You haven't liked anyone recently. Go discover some amazing devs!"
                                    actionLabel="Go Discover"
                                    actionHref="/discover"
                                />
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    {pending.map((p, i) => (
                                        <PendingLikeItem
                                            key={p.targetId}
                                            targetId={p.targetId}
                                            swipeType={p.swipeType}
                                            likedAt={p.likedAt}
                                            user={p.user}
                                            index={i}
                                            onUndo={(id) => setPending(prev => prev.filter(item => item.targetId !== id))}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "hackathons" && (
                        <motion.div
                            key="hackathons"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {hackathons.length === 0 ? (
                                <EmptyState
                                    emoji="🏆"
                                    title="No hackathons joined"
                                    subtitle="You haven't joined any hackathons yet. Find one and start building!"
                                    actionLabel="Browse Hackathons"
                                    actionHref="/discover"
                                />
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {hackathons.map((h, i) => (
                                        <div key={h.id} style={{
                                            padding: "1.25rem",
                                            background: "var(--bg-surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "1rem",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <div>
                                                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{h.name}</h3>
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                                                    {new Date(h.startDate).toLocaleDateString()} · {h.mode}
                                                </p>
                                                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem" }}>
                                                    {h.themes.slice(0, 2).map((t: string) => (
                                                        <span key={t} style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: "0.4rem", background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                                                <button 
                                                    onClick={() => router.push(`/discover`)} // Future: /hackathons/[id] group chat
                                                    style={{
                                                        padding: "0.5rem 1rem",
                                                        borderRadius: "var(--radius-md)",
                                                        border: "1px solid #fbbf24",
                                                        background: "transparent",
                                                        color: "#fbbf24",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    View Community
                                                </button>
                                                <button 
                                                    onClick={() => handleLeaveHackathon(h.id)}
                                                    style={{
                                                        padding: "0.5rem 1rem",
                                                        borderRadius: "var(--radius-md)",
                                                        border: "1px solid rgba(239, 68, 68, 0.4)",
                                                        background: "transparent",
                                                        color: "#ef4444",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    Leave Team
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

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

type Tab = "matches" | "pending";

export default function MatchesPage() {
    const { status } = useSession();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("matches");
    const [matches, setMatches] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        Promise.all([
            api.get(`/api/matches`),
            api.get(`/api/swipes/pending`),
        ])
            .then(([matchRes, pendingRes]) => {
                setMatches(matchRes.data);
                setPending(pendingRes.data);
            })
            .catch(() => { })
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
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <main style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: "2rem 1rem" }}>

                {/* Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8614a", marginBottom: "0.2rem" }}>
                        Your GitMatches
                    </h1>
                    <p style={{ fontSize: "0.85rem", color: "#555" }}>
                        {matches.length} mutual · {pending.length} pending
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0" }}>
                    <button style={TAB_STYLES(tab === "matches", "#e8614a")} onClick={() => setTab("matches")}>
                        🔗 Matches
                        {matches.length > 0 && (
                            <span style={{ marginLeft: "0.4rem", background: "#e8614a", color: "#fff", borderRadius: "999px", padding: "0.05rem 0.45rem", fontSize: "0.7rem" }}>
                                {matches.length}
                            </span>
                        )}
                    </button>
                    <button style={TAB_STYLES(tab === "pending", "#fbbf24")} onClick={() => setTab("pending")}>
                        ⏳ Pending Likes
                        {pending.length > 0 && (
                            <span style={{ marginLeft: "0.4rem", background: "#fbbf24", color: "#000", borderRadius: "999px", padding: "0.05rem 0.45rem", fontSize: "0.7rem", fontWeight: 800 }}>
                                {pending.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {tab === "matches" && (
                        <motion.div
                            key="matches"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {matches.length === 0 ? (
                                <EmptyState
                                    emoji="🔍"
                                    title="No matches yet"
                                    subtitle="Go discover some developers!"
                                    actionLabel="Start Discovering"
                                    actionHref="/discover"
                                />
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {matches.map((m, i) => (
                                        <MatchListItem
                                            key={m.matchId ?? m.id}
                                            matchId={m.matchId ?? m.id}
                                            partner={m.partner}
                                            lastMessage={m.lastMessage}
                                            compatibilityScore={m.compatibilityScore}
                                            index={i}
                                            onUnmatch={() => {
                                                setMatches(prev => prev.filter(item => (item.matchId ?? item.id) !== (m.matchId ?? m.id)));
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {tab === "pending" && (
                        <motion.div
                            key="pending"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {pending.length === 0 ? (
                                <EmptyState
                                    emoji="💛"
                                    title="No pending likes"
                                    subtitle="Go like some developers to see them here!"
                                    actionLabel="Start Swiping"
                                    actionHref="/discover"
                                />
                            ) : (
                                <>
                                    <p style={{ fontSize: "0.75rem", color: "#555", marginBottom: "1rem" }}>
                                        These people are waiting for a match. Undo a like to send them back to your queue.
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                                        {pending.map((p, i) => (
                                            <PendingLikeItem
                                                key={p.targetId}
                                                targetId={p.targetId}
                                                swipeType={p.swipeType}
                                                likedAt={p.likedAt}
                                                user={p.user}
                                                index={i}
                                                onUndo={(id) => {
                                                    setPending(prev => prev.filter(item => item.targetId !== id));
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

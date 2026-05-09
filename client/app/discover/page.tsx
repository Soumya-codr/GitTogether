"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Navbar from "@/components/shared/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { SwipeCard } from "@/components/discover/SwipeCard";
import ActionButtons from "@/components/discover/ActionButtons";
import MatchPopup from "@/components/discover/MatchPopup";
import IntentBanner from "@/components/discover/IntentBanner";
import NetworkingFeed from "@/components/discover/NetworkingFeed";
import HackathonFeed from "@/components/discover/HackathonFeed";
import RepoFeed from "@/components/discover/RepoFeed";
import { INTENT_CONFIGS, DEFAULT_INTENT } from "@/lib/intentConfig";

export default function DiscoverPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [deck, setDeck] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchVisible, setMatchVisible] = useState(false);
    const [intentMode, setIntentMode] = useState<string>("casual");

    // Hackathon two-step flow state
    const [selectedHackathon, setSelectedHackathon] = useState<{ id: string; name: string } | null>(null);
    const [hackathonDeck, setHackathonDeck] = useState<any[]>([]);
    const [hackathonLoading, setHackathonLoading] = useState(false);
    const [currentHackathonId, setCurrentHackathonId] = useState<string | null>(null);

    useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status, router]);

    useEffect(() => {
        const saved = localStorage.getItem("gt_intent");
        if (saved && INTENT_CONFIGS[saved]) setIntentMode(saved);
    }, []);

    const intentConfig = INTENT_CONFIGS[intentMode] || DEFAULT_INTENT;

    const fetchDeck = useCallback(async () => {
        setLoading(true);
        try {
            // Don't fetch the regular user deck if we are looking for repos
            if (intentMode === "collab") return;
            const res = await api.get(`/api/discover?intent=${intentMode}`);
            setDeck(res.data);
        } catch {}
        finally { setLoading(false); }
    }, [intentMode]);

    useEffect(() => {
        if (status === "authenticated" && intentMode !== "hackathon") fetchDeck();
        if (status === "authenticated" && intentMode === "hackathon") setLoading(false);
    }, [status, fetchDeck, intentMode]);

    // When a hackathon is joined, we just record it and stay on the deck
    const handleSelectHackathon = async (hackathonId: string, hackathonName: string) => {
        // No longer setting selectedHackathon here to avoid auto-transition
        // This keeps the user on the Hackathon browsing deck
        console.log(`✅ Joined hackathon: ${hackathonName}`);
    };

    const handleSwipe = async (targetId: string, swipeType: "like" | "pass" | "superlike") => {
        if (selectedHackathon) {
            setHackathonDeck((prev) => prev.filter((d) => d.id !== targetId));
        } else {
            setDeck((prev) => prev.filter((d) => d.id !== targetId));
        }
        try {
            const res = await api.post(`/api/swipes`, { targetId, swipeType });
            if (res.data.matched) {
                setMatchVisible(true);
                setTimeout(() => setMatchVisible(false), 5500);
            }
        } catch {}
    };

    if (status === "loading" || loading) return <LoadingSpinner />;

    // Determine which deck to use
    const activeDeck = selectedHackathon ? hackathonDeck : deck;
    const top3 = activeDeck.slice(0, 3);
    const current = activeDeck[0];

    // Hackathon mode: two-step flow
    const isHackathonBrowsing = intentMode === "hackathon" && !selectedHackathon;
    const isHackathonMatching = intentMode === "hackathon" && selectedHackathon;

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
            <Navbar />
            <MatchPopup visible={matchVisible} intentMode={intentMode} />

            <main style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: isHackathonBrowsing ? "flex-start" : "center",
                padding: "1.5rem 1rem 2rem",
                gap: "1.5rem",
            }}>
                {/* Mode indicator pill */}
                <IntentBanner config={intentConfig} onChangeIntent={() => router.push("/intent")} />

                {/* Back to hackathons button (when in partner matching) */}
                {isHackathonMatching && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => { setSelectedHackathon(null); setHackathonDeck([]); }}
                        style={{
                            padding: "0.4rem 0.9rem",
                            borderRadius: "var(--radius-full)",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            alignSelf: "flex-start",
                        }}
                    >
                        ← Back to Hackathons
                    </motion.button>
                )}

                {/* Hackathon name badge when matching */}
                {isHackathonMatching && (
                    <div style={{
                        padding: "0.35rem 0.8rem",
                        borderRadius: "var(--radius-full)",
                        background: "rgba(251,191,36,0.08)",
                        border: "1px solid rgba(251,191,36,0.2)",
                        color: "#fbbf24",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                    }}>
                        🏆 Finding teammates for {selectedHackathon.name}
                    </div>
                )}

                {/* Step 1: Hackathon Browsing Feed (Cards with Buttons) */}
                {isHackathonBrowsing ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", width: "100%" }}>
                        <HackathonFeed 
                            onSelectHackathon={handleSelectHackathon} 
                            onTopCardChange={(id) => setCurrentHackathonId(id)}
                        />
                        {/* THE BUTTONS FOR HACKATHONS */}
                        <ActionButtons
                            onPass={() => {
                                window.dispatchEvent(new CustomEvent('hackathon-swipe', { detail: { type: 'pass' } }));
                            }}
                            onSuperLike={() => {
                                window.dispatchEvent(new CustomEvent('hackathon-swipe', { detail: { type: 'join' } }));
                            }}
                            onLike={() => {
                                window.dispatchEvent(new CustomEvent('hackathon-swipe', { detail: { type: 'join' } }));
                            }}
                            accentColor="#fbbf24"
                            likeLabel="JOIN"
                        />
                    </div>

                /* Step 2: Hackathon Partner Matching (loading state) */
                ) : hackathonLoading ? (
                    <LoadingSpinner />

                /* Repo Collaboration Flow */
                ) : intentMode === "collab" ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", width: "100%" }}>
                        <RepoFeed />
                        <ActionButtons
                            onPass={() => {
                                window.dispatchEvent(new CustomEvent('repo-swipe', { detail: { type: 'pass' } }));
                            }}
                            onLike={() => {
                                window.dispatchEvent(new CustomEvent('repo-swipe', { detail: { type: 'like' } }));
                            }}
                            accentColor="#a78bfa"
                            likeLabel="BUILD"
                            onSuperLike={() => {}}
                        />
                    </div>

                /* Normal or Hackathon partner swipe flow */
                ) : activeDeck.length === 0 ? (
                    <EmptyState
                        emoji={isHackathonMatching ? "🏆" : "🤷"}
                        title={isHackathonMatching ? "No teammates yet!" : "You've seen everyone!"}
                        subtitle={isHackathonMatching
                            ? `No one else has joined ${selectedHackathon?.name} yet. Share the link to invite devs!`
                            : intentConfig.emptyMsg || "Check back later — new developers join every day."}
                        actionLabel={isHackathonMatching ? "Back to Hackathons" : "Refresh"}
                        onAction={isHackathonMatching ? () => { setSelectedHackathon(null); setHackathonDeck([]); } : fetchDeck}
                    />
                ) : intentMode === "networking" ? (
                    <NetworkingFeed deck={deck} onConnect={handleSwipe} intentConfig={intentConfig} />
                ) : (
                    <>
                        {/* Card deck */}
                        <motion.div
                            className="card-deck-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {top3.map((dev, i) => (
                                <SwipeCard
                                    key={dev.id}
                                    developer={dev}
                                    onSwipe={handleSwipe}
                                    isTop={i === 0}
                                    stackIndex={i}
                                    intentConfig={intentConfig}
                                />
                            ))}
                        </motion.div>

                        {/* Action buttons */}
                        <ActionButtons
                            onPass={() => handleSwipe(current.id, "pass")}
                            onSuperLike={() => handleSwipe(current.id, "superlike")}
                            onLike={() => handleSwipe(current.id, "like")}
                            accentColor={intentConfig.accentColor}
                            likeLabel={intentConfig.likeLabel}
                        />

                        {/* Queue hint */}
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                            {intentConfig.actionHint} · {activeDeck.length} in queue
                        </p>
                    </>
                )}
            </main>
        </div>
    );
}

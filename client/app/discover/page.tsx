"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/shared/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { SwipeCard } from "@/components/discover/SwipeCard";
import ActionButtons from "@/components/discover/ActionButtons";
import MatchPopup from "@/components/discover/MatchPopup";
import IntentBanner from "@/components/discover/IntentBanner";
import { INTENT_CONFIGS, DEFAULT_INTENT } from "@/lib/intentConfig";



export default function DiscoverPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [deck, setDeck] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchVisible, setMatchVisible] = useState(false);
    const [intentMode, setIntentMode] = useState<string>("casual");

    useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status, router]);

    // Read intent from localStorage (set on /intent page)
    useEffect(() => {
        const saved = localStorage.getItem("gt_intent");
        if (saved && INTENT_CONFIGS[saved]) setIntentMode(saved);
    }, []);

    const intentConfig = INTENT_CONFIGS[intentMode] || DEFAULT_INTENT;

    const fetchDeck = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/discover?intent=${intentMode}`);
            setDeck(res.data);
        } catch { }
        finally { setLoading(false); }
    }, [intentMode]);

    useEffect(() => { if (status === "authenticated") fetchDeck(); }, [status, fetchDeck]);

    const handleSwipe = async (targetId: string, swipeType: "like" | "pass" | "superlike") => {
        setDeck((prev) => prev.filter((d) => d.id !== targetId));
        try {
            const res = await axios.post(`/api/swipes`, { targetId, swipeType });
            if (res.data.matched) {
                setMatchVisible(true);
                setTimeout(() => setMatchVisible(false), 4000);
            }
        } catch { }
    };

    if (status === "loading" || loading) return <LoadingSpinner />;

    const top3 = deck.slice(0, 3);
    const current = deck[0];

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <MatchPopup visible={matchVisible} />

            <main style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem 1rem",
                gap: "1.25rem",
            }}>
                {/* Intent banner at top */}
                <IntentBanner
                    config={intentConfig}
                    onChangeIntent={() => router.push("/intent")}
                />

                {deck.length === 0 ? (
                    <EmptyState
                        emoji="🤷‍♂️"
                        title="You've seen everyone!"
                        subtitle={intentConfig.emptyMsg}
                        actionLabel="Refresh"
                        onAction={fetchDeck}
                    />
                ) : (
                    <>
                        <div className="card-deck-container">
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
                        </div>

                        <ActionButtons
                            onPass={() => handleSwipe(current.id, "pass")}
                            onSuperLike={() => handleSwipe(current.id, "superlike")}
                            onLike={() => handleSwipe(current.id, "like")}
                            accentColor={intentConfig.accentColor}
                        />

                        <p style={{ fontSize: "0.73rem", color: "var(--muted)" }}>
                            {intentConfig.actionHint} · {deck.length} in queue
                        </p>
                    </>
                )}
            </main>
        </div>
    );
}

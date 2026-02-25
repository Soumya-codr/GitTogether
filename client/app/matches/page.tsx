"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/shared/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import MatchListItem from "@/components/matches/MatchListItem";



export default function MatchesPage() {
    const { status } = useSession();
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        axios.get(`/api/matches`)
            .then((r) => setMatches(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [status]);

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <main style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: "2.5rem 1rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8614a", marginBottom: "0.25rem" }}>Your GitMatches</h1>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "2rem" }}>{matches.length} mutual connections</p>

                {matches.length === 0 ? (
                    <EmptyState emoji="🔍" title="No matches yet" subtitle="Go discover some developers!" actionLabel="Start Discovering" actionHref="/discover" />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {matches.map((m, i) => (
                            <MatchListItem
                                key={m.matchId}
                                matchId={m.matchId}
                                partner={m.partner}
                                lastMessage={m.lastMessage}
                                compatibilityScore={m.compatibilityScore}
                                index={i}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

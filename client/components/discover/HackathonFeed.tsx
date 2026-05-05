"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { HackathonSwipeCard } from "./HackathonSwipeCard";

interface Hackathon {
    id: string;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string;
    mode: string;
    prizePool: string | null;
    themes: string[];
    techTags: string[];
    organizer: string | null;
    website: string | null;
    imageUrl: string | null;
    featured: boolean;
    interestedCount: number;
    hasJoined: boolean;
}

interface HackathonFeedProps {
    onSelectHackathon: (hackathonId: string, hackathonName: string) => void;
    onTopCardChange?: (id: string | null) => void;
}

export default function HackathonFeed({ onSelectHackathon, onTopCardChange }: HackathonFeedProps) {
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Ref to keep track of the current hackathons for the event listener
    const hackathonsRef = useRef<Hackathon[]>([]);
    useEffect(() => {
        hackathonsRef.current = hackathons;
    }, [hackathons]);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await api.get("/api/hackathons");
                setHackathons(res.data);
            } catch (err) {
                console.error("Failed to fetch hackathons:", err);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const handleSwipe = (id: string, type: "join" | "pass") => {
        const swipedHackathon = hackathonsRef.current.find(h => h.id === id);
        if (!swipedHackathon) return;

        console.log(`🎯 Swiping ${type} on ${swipedHackathon.name} (${id})`);

        // 1. CALL API IMMEDIATELY (Don't await)
        if (type === "join") {
            api.post(`/api/hackathons/${id}/join`)
                .catch(err => console.error("❌ Join failed:", err));
        } else {
            api.post(`/api/hackathons/${id}/pass`)
                .catch(err => console.error("❌ Pass failed:", err));
        }

        // 2. UPDATE UI IMMEDIATELY
        setHackathons(prev => prev.filter(h => h.id !== id));
        
        // 3. Notify parent
        onSelectHackathon(id, swipedHackathon.name);
    };

    // Listen for button clicks
    useEffect(() => {
        const handleRemoteSwipe = (e: any) => {
            const topCard = hackathonsRef.current[0];
            if (topCard) {
                handleSwipe(topCard.id, e.detail.type);
            }
        };

        window.addEventListener('hackathon-swipe', handleRemoteSwipe);
        return () => window.removeEventListener('hackathon-swipe', handleRemoteSwipe);
    }, []); // Empty deps because we use Ref

    useEffect(() => {
        if (onTopCardChange) {
            onTopCardChange(hackathons[0]?.id || null);
        }
    }, [hackathons, onTopCardChange]);

    if (loading) {
        return <div className="skeleton" style={{ width: "380px", height: "540px", borderRadius: "2rem" }} />;
    }

    if (hackathons.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <p style={{ fontSize: "3rem" }}>🏆</p>
                <h3 style={{ color: "var(--text-primary)", fontWeight: 900 }}>All swiped!</h3>
                <p style={{ color: "var(--text-secondary)" }}>Check back later for new events.</p>
                <button 
                    onClick={() => window.location.reload()}
                    style={{ marginTop: "1rem", padding: "0.5rem 1.5rem", borderRadius: "1rem", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", cursor: "pointer" }}
                >
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            width: "100%", 
            maxWidth: "400px"
        }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-primary)" }}>Find Your Challenge 🏆</h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Swipe or use buttons to join</p>
            </div>
            
            <div style={{ position: "relative", width: "100%", height: "540px", display: "flex", justifyContent: "center" }}>
                <AnimatePresence mode="popLayout">
                    {hackathons.slice(0, 3).map((h, i) => (
                        <HackathonSwipeCard
                            key={h.id}
                            hackathon={h}
                            onSwipe={handleSwipe}
                            isTop={i === 0}
                            stackIndex={i}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Repo {
    id: string;
    name: string;
    description: string | null;
    url: string;
    stars: number;
    language: string | null;
    topics: string[];
    user: {
        id: string;
        username: string;
        avatarUrl: string;
    };
}

/** Generate a human-readable fallback when GitHub description is null */
function generateFallbackDescription(repo: Repo): string {
    // Humanize repo name: camelCase / kebab-case / snake_case → readable
    const readableName = repo.name
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const parts: string[] = [];
    if (repo.language && repo.language !== 'Unknown') parts.push(`${repo.language} project`);
    if (repo.topics.length > 0) parts.push(repo.topics.slice(0, 3).join(', '));
    if (repo.stars > 0) parts.push(`${repo.stars} ⭐`);

    return parts.length > 0
        ? `${readableName} — ${parts.join(' · ')}`
        : `${readableName} — Explore this project on GitHub`;
}

export default function RepoFeed() {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const reposRef = useRef<Repo[]>([]);

    useEffect(() => {
        reposRef.current = repos;
    }, [repos]);

    useEffect(() => {
        async function fetchRepos() {
            try {
                const res = await api.get("/api/repos");
                setRepos(res.data);
            } catch (err) {
                console.error("Failed to fetch repos:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRepos();
    }, []);

    const handleSwipe = async (id: string, swipeType: "like" | "pass") => {
        const swipedRepo = reposRef.current.find(r => r.id === id);
        if (!swipedRepo) return;

        setRepos(prev => prev.filter(r => r.id !== id));

        try {
            await api.post(`/api/repos/${id}/swipe`, { swipeType });
        } catch (err) {
            console.error("❌ Repo swipe failed:", err);
        }
    };

    useEffect(() => {
        const handleRemoteSwipe = (e: any) => {
            const topCard = reposRef.current[0];
            if (topCard) {
                handleSwipe(topCard.id, e.detail.type);
            }
        };
        window.addEventListener('repo-swipe', handleRemoteSwipe);
        return () => window.removeEventListener('repo-swipe', handleRemoteSwipe);
    }, []);

    if (loading) return <div className="skeleton" style={{ width: "380px", height: "540px", borderRadius: "2rem" }} />;

    if (repos.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <p style={{ fontSize: "3rem" }}>🚀</p>
                <h3 style={{ color: "var(--text-primary)", fontWeight: 900 }}>No projects found!</h3>
                <p style={{ color: "var(--text-secondary)" }}>Check back later for new repositories.</p>
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "400px" }}>
            <div style={{ position: "relative", width: "100%", height: "540px", display: "flex", justifyContent: "center" }}>
                <AnimatePresence mode="popLayout">
                    {repos.slice(0, 3).map((repo, i) => {
                        const isTop = i === 0;
                        return (
                            <motion.div
                                key={repo.id}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: i * 8, 
                                    scale: 1 - i * 0.05,
                                    zIndex: 3 - i
                                }}
                                exit={{ opacity: 0, x: -200, rotate: -20 }}
                                drag={isTop ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(e, info) => {
                                    if (info.offset.x > 100) handleSwipe(repo.id, "like");
                                    else if (info.offset.x < -100) handleSwipe(repo.id, "pass");
                                }}
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    background: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "2rem",
                                    padding: "1.5rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    cursor: isTop ? "grab" : "auto",
                                    boxShadow: isTop ? "0 20px 40px rgba(0,0,0,0.4)" : "none",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                                    <img src={repo.user.avatarUrl} alt={repo.user.username} style={{ width: 40, height: 40, borderRadius: "50%" }} />
                                    <div>
                                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{repo.user.username}</p>
                                        <div
                                            role="link"
                                            tabIndex={0}
                                            style={{ textDecoration: "none", position: "relative", zIndex: 50, cursor: "pointer", userSelect: "none" }}
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                (e.currentTarget as any)._clickStart = { x: e.clientX, y: e.clientY };
                                            }}
                                            onPointerUp={(e) => {
                                                e.stopPropagation();
                                                const start = (e.currentTarget as any)._clickStart;
                                                if (start) {
                                                    const dx = Math.abs(e.clientX - start.x);
                                                    const dy = Math.abs(e.clientY - start.y);
                                                    if (dx < 5 && dy < 5) {
                                                        // Treat as a click — open the repo URL
                                                        const link = document.createElement("a");
                                                        link.href = repo.url;
                                                        link.target = "_blank";
                                                        link.rel = "noopener noreferrer";
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }
                                                }
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => { if (e.key === "Enter") window.open(repo.url, "_blank"); }}
                                            draggable={false}
                                        >
                                            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem", transition: "color 0.2s", cursor: "pointer" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-primary)"}>
                                                {repo.name}
                                                <span style={{ fontSize: "0.9rem", opacity: 0.6 }}>↗</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.5, flex: 1 }}>
                                {repo.description || generateFallbackDescription(repo)}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
                                    {repo.language && (
                                        <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", background: "var(--bg-elevated)", color: "#a78bfa", borderRadius: "1rem", border: "1px solid rgba(167,139,250,0.2)" }}>
                                            {repo.language}
                                        </span>
                                    )}
                                    {repo.topics.slice(0, 3).map(t => (
                                        <span key={t} style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", background: "var(--bg-elevated)", color: "var(--text-secondary)", borderRadius: "1rem", border: "1px solid var(--border)" }}>
                                            #{t}
                                        </span>
                                    ))}
                                    <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", background: "var(--bg-elevated)", color: "#fbbf24", borderRadius: "1rem", border: "1px solid rgba(251,191,36,0.2)" }}>
                                        ⭐ {repo.stars}
                                    </span>
                                </div>
                                {isTop && (
                                    <div style={{ position: "absolute", bottom: "1.5rem", left: 0, right: 0, textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                        Swipe right to collaborate
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

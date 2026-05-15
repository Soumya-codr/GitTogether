"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
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
    const readableName = repo.name
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const parts: string[] = [];
    if (repo.language && repo.language !== 'Unknown') parts.push(`A ${repo.language} project`);
    if (repo.topics.length > 0) parts.push(`Topics: ${repo.topics.slice(0, 3).join(', ')}`);

    return parts.length > 0
        ? `${readableName}. ${parts.join('. ')}.`
        : `Explore ${readableName} on GitHub — contributions welcome!`;
}
/** Pure SVG radar chart from existing repo data — no DB needed */
function RepoMiniGraph({ repo }: { repo: Repo }) {
    const size = 160; // Increased size
    const cx = size / 2;
    const cy = size / 2;
    const r = 55;   // Increased radius
    const axes = 5;

    // Derived scores for the chart
    const starsScore   = Math.min(repo.stars / 100, 1) * 0.8 + 0.2;
    const topicsScore  = Math.min(repo.topics.length / 8, 1) * 0.7 + 0.3;
    const langScore    = repo.language ? 0.9 : 0.4;
    const activityScore = 0.75; 
    const complexScore  = Math.min(repo.name.length / 20, 1) * 0.6 + 0.4;

    const scores = [starsScore, topicsScore, langScore, activityScore, complexScore];
    const labels = ["STARS", "TECH", "LANG", "ACTIVITY", "BUILD"];
    const COLORS = ["#fbbf24", "#a78bfa", "#60a5fa", "#f472b6", "#34d399"];

    const point = (i: number, v: number) => {
        const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
        return { x: cx + r * v * Math.cos(angle), y: cy + r * v * Math.sin(angle) };
    };

    const polyPoints = scores.map((v, i) => { const p = point(i, v); return `${p.x},${p.y}`; }).join(" ");
    const rings = [0.4, 0.7, 1];

    return (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, overflow: "visible" }}>
                <defs>
                    <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(167,139,250,0.5)" />
                        <stop offset="100%" stopColor="rgba(167,139,250,0.1)" />
                    </radialGradient>
                </defs>
                {/* Background rings */}
                {rings.map((rv) => (
                    <polygon key={rv}
                        points={Array.from({ length: axes }, (_, i) => { const p = point(i, rv); return `${p.x},${p.y}`; }).join(" ")}
                        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray={rv === 1 ? "0" : "3,3"}
                    />
                ))}
                {/* Data polygon */}
                <polygon points={polyPoints} fill="url(#radarGrad)" stroke="#a78bfa" strokeWidth="2.5" strokeLinejoin="round" />
                {/* Data points */}
                {scores.map((v, i) => {
                    const p = point(i, v);
                    return <circle key={i} cx={p.x} cy={p.y} r={4} fill={COLORS[i]} stroke="#000" strokeWidth="1.5" />;
                })}
                {/* Labels */}
                {labels.map((label, i) => {
                    const p = point(i, 1.4); // Push labels further out
                    return (
                        <text key={i} x={p.x} y={p.y} 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            fontSize="9" 
                            fill={COLORS[i]} 
                            fontWeight="900" 
                            style={{ textTransform: "uppercase", letterSpacing: "0.05em", filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
                        >
                            {label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

/* ─── Single Card Component (top = draggable, others = stack peek) ─── */
function RepoCard({
    repo,
    isTop,
    stackIndex,
    onSwipe,
}: {
    repo: Repo;
    isTop: boolean;
    stackIndex: number;
    onSwipe: (id: string, type: "like" | "pass") => void;
}) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-250, 250], [-18, 18]);
    const repoUrl = repo.url || `https://github.com/${repo.user.username}/${repo.name}`;

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 100) {
            animate(x, 600, { duration: 0.4, ease: "easeOut" });
            setTimeout(() => onSwipe(repo.id, "like"), 350);
        } else if (info.offset.x < -100) {
            animate(x, -600, { duration: 0.4, ease: "easeOut" });
            setTimeout(() => onSwipe(repo.id, "pass"), 350);
        } else {
            animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        }
    };

    // Like/Pass overlay opacity
    const likeOpacity = useTransform(x, [20, 120], [0, 1]);
    const passOpacity = useTransform(x, [-20, -120], [0, 1]);

    return (
        <motion.div
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            style={{
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                transformOrigin: "bottom center",
                position: "absolute",
                width: "100%",
                height: "100%",
                top: `${stackIndex * 10}px`,
                scale: 1 - stackIndex * 0.04,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "2rem",
                display: "flex",
                flexDirection: "column",
                boxShadow: isTop ? "0 20px 40px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.3)",
                zIndex: 10 - stackIndex,
                overflow: "hidden",
                touchAction: isTop ? "none" : "auto",
                cursor: isTop ? "grab" : "default",
                pointerEvents: isTop ? "auto" : "none",
            }}
            whileTap={isTop ? { cursor: "grabbing" } : {}}
            onDragEnd={isTop ? handleDragEnd : undefined}
        >
            {/* Like badge */}
            <motion.div style={{ opacity: likeOpacity, position: "absolute", top: "1.5rem", left: "1.5rem", zIndex: 10 }}>
                <div style={{
                    padding: "0.3rem 0.8rem", borderRadius: "0.5rem",
                    border: "3px solid #22c55e", color: "#22c55e",
                    fontWeight: 900, fontSize: "1.1rem", transform: "rotate(-12deg)",
                }}>BUILD ✓</div>
            </motion.div>

            {/* Pass badge */}
            <motion.div style={{ opacity: passOpacity, position: "absolute", top: "1.5rem", right: "1.5rem", zIndex: 10 }}>
                <div style={{
                    padding: "0.3rem 0.8rem", borderRadius: "0.5rem",
                    border: "3px solid #ef4444", color: "#ef4444",
                    fontWeight: 900, fontSize: "1.1rem", transform: "rotate(12deg)",
                }}>PASS ✗</div>
            </motion.div>

            {/* Header — NOT a drag trigger */}
            <div
                style={{ padding: "1.5rem 1.5rem 0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <img
                    src={repo.user.avatarUrl}
                    alt={repo.user.username}
                    style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }}
                    draggable={false}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                        {repo.user.username}
                    </p>
                    <a
                        href={repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                        <span
                            style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", transition: "color 0.2s", wordBreak: "break-word" }}
                            onMouseOver={(e) => (e.currentTarget.style.color = "var(--accent)")}
                            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                        >
                            {repo.name}
                        </span>
                        <span style={{ fontSize: "0.85rem", opacity: 0.5, color: "var(--text-primary)", flexShrink: 0 }}>↗</span>
                    </a>
                </div>
            </div>

            {/* Body — fills the whole middle */}
            <div style={{
                flex: 1,
                padding: "0 1.5rem 0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "0.75rem",
            }}>
                {/* Gradient accent bar */}
                <div style={{
                    height: "3px",
                    borderRadius: "2px",
                    background: "linear-gradient(90deg, #a78bfa, #6366f1, #3b82f6)",
                    marginBottom: "0.25rem",
                }} />

                {/* Description + Graph section */}
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", minHeight: 140 }}>
                    <p style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        flex: 1,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>
                        {repo.description || generateFallbackDescription(repo)}
                    </p>
                    <RepoMiniGraph repo={repo} />
                </div>

                {/* Compatibility Breakdown (Simulated based on repo data) */}
                <div style={{ 
                    padding: "1rem", 
                    background: "rgba(255,255,255,0.03)", 
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.05)"
                }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                        Compatibility Breakdown
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {[
                            { label: "STACK", val: repo.language ? 85 : 40, color: "#a78bfa" },
                            { label: "DOMAIN", val: repo.topics.length > 0 ? 90 : 30, color: "#60a5fa" },
                            { label: "ACTIVITY", val: 75, color: "#fbbf24" },
                            { label: "INTENT", val: 100, color: "#f472b6" },
                        ].map(item => (
                            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)", width: 60 }}>{item.label}</span>
                                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.val}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        style={{ height: "100%", background: item.color }} 
                                    />
                                </div>
                                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: item.color, width: 30, textAlign: "right" }}>{item.val}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "0.25rem 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "1.1rem" }}>⭐</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fbbf24" }}>{repo.stars}</span>
                    </div>
                    {repo.language && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 8px rgba(167,139,250,0.5)" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a78bfa" }}>{repo.language}</span>
                        </div>
                    )}
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {repo.language && (
                        <span style={{
                            fontSize: "0.72rem", padding: "0.25rem 0.6rem",
                            background: "rgba(167,139,250,0.12)", color: "#a78bfa",
                            borderRadius: "2rem", border: "1px solid rgba(167,139,250,0.25)", fontWeight: 600,
                        }}>
                            {repo.language}
                        </span>
                    )}
                    {repo.topics.slice(0, 3).map((t) => (
                        <span key={t} style={{
                            fontSize: "0.72rem", padding: "0.25rem 0.6rem",
                            background: "var(--bg-elevated)", color: "var(--text-secondary)",
                            borderRadius: "2rem", border: "1px solid var(--border)", fontWeight: 500,
                        }}>
                            #{t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "1rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* View on GitHub button — stops drag propagation */}
                <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerDown={(e) => e.stopPropagation()}
                    draggable={false}
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: "0.5rem", padding: "0.65rem 1rem",
                        borderRadius: "0.85rem",
                        border: "1px solid rgba(167,139,250,0.3)",
                        background: "rgba(167,139,250,0.1)",
                        color: "#a78bfa", fontSize: "0.85rem", fontWeight: 700,
                        textDecoration: "none", transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = "rgba(167,139,250,0.2)";
                        e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = "rgba(167,139,250,0.1)";
                        e.currentTarget.style.borderColor = "rgba(167,139,250,0.3)";
                    }}
                >
                    🔗 View on GitHub
                </a>

                <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, margin: 0 }}>
                    ← Swipe left to pass · Swipe right to build →
                </p>
            </div>
        </motion.div>
    );
}


/* ─── Main Feed Component ─── */
export default function RepoFeed() {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const reposRef = useRef<Repo[]>([]);
    const pathname = usePathname();

    useEffect(() => { reposRef.current = repos; }, [repos]);

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

        // Check if user removed a project from Matches page — if so force fresh fetch
        const needsRefetch = localStorage.getItem("repos-need-refetch");
        if (needsRefetch) {
            localStorage.removeItem("repos-need-refetch");
        }
        fetchRepos();
    }, []);

    const handleSwipe = async (id: string, swipeType: "like" | "pass") => {
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
            if (topCard) handleSwipe(topCard.id, e.detail.type);
        };
        window.addEventListener('repo-swipe', handleRemoteSwipe);
        return () => window.removeEventListener('repo-swipe', handleRemoteSwipe);
    }, []);

    // Refetch when navigating back to discover if a project was removed
    useEffect(() => {
        if (!pathname?.includes("discover")) return;
        const needsRefetch = localStorage.getItem("repos-need-refetch");
        if (needsRefetch) {
            localStorage.removeItem("repos-need-refetch");
            api.get("/api/repos")
                .then(res => setRepos(res.data))
                .catch(err => console.error("Refetch failed:", err));
        }
    }, [pathname]);

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
            <div style={{ position: "relative", width: "100%", height: "560px", display: "flex", justifyContent: "center" }}>
                <AnimatePresence>
                    {repos.slice(0, 3).map((repo, i) => (
                        <RepoCard
                            key={repo.id}
                            repo={repo}
                            isTop={i === 0}
                            stackIndex={i}
                            onSwipe={handleSwipe}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

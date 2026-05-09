"use client";
const getFeaturedRepo = (d: any): any => ({ repoName: "", language: "", stars: 0 });
const getCoderPersonality = (d: any) => "Coder";
const HEADER_GRADIENTS: any = { casual: "", networking: "" };

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef } from "react";
import { MapPin, Heart, X } from "lucide-react";
import type { IntentConfig } from "@/lib/intentConfig";

interface Developer {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    primaryStack: string[];
    compatibilityScore: number;
    intentMode: string;
    repositories?: { repoName: string; stars: number; language: string | null; topics: string[] }[];
}

interface SwipeCardProps {
    developer: Developer;
    onSwipe: (id: string, type: "like" | "pass" | "superlike") => void;
    isTop: boolean;
    stackIndex: number;
    intentConfig: IntentConfig;
}

const LANG_COLORS: Record<string, string> = {
    JavaScript: "#F7DF1E", TypeScript: "#3178C6", Python: "#3572A5",
    Go: "#00ADD8", Rust: "#DEA584", Java: "#B07219", "C++": "#F34B7D",
    Ruby: "#701516", Swift: "#FA7343", Kotlin: "#A97BFF",
    CSS: "#563D7C", HTML: "#E34C26", PHP: "#777BB4",
};

function getScoreColor(score: number): string {
    if (score >= 90) return "#22C55E";
    if (score >= 70) return "#F59E0B";
    return "#C026D3";
}

// Body-specific info section per mode
function ModeBody({ developer, intentConfig }: { developer: Developer; intentConfig: IntentConfig }) {
    const accent = intentConfig.accentColor;
    const mode = intentConfig.id;
    const repos = developer.repositories || [];

    if (mode === "networking") {
        const totalStars = repos.reduce((s, r) => s + r.stars, 0);
        const stack      = (developer.primaryStack as string[]);

        return (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: `${accent}20` }}>
                <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "#888" }}>Professional Highlights</p>
                <div className="flex gap-4 mb-4">
                    <div>
                        <p className="text-sm font-bold text-white">{repos.length}</p>
                        <p className="text-xs" style={{ color: "#888" }}>Projects</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{totalStars}</p>
                        <p className="text-xs" style={{ color: "#888" }}>Stars</p>
                    </div>
                </div>
                <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "#888" }}>Top Skills</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {stack.slice(0, 5).map(lang => (
                        <span key={lang} style={{
                            display: "flex", alignItems: "center", gap: "0.25rem",
                            fontSize: "0.7rem", fontWeight: 500,
                            padding: "0.2rem 0.6rem", borderRadius: "0.25rem",
                            background: "rgba(255,255,255,0.05)",
                            color: "#ccc",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}>
                            {lang}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    if (mode === "collab") {
        const repo = getFeaturedRepo(developer);
        return (
            <>
                {repo && (
                    <div className="p-3 rounded-xl" style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>🚀 Featured Project</p>
                        <p className="text-sm font-bold text-white">{repo.repoName}</p>
                        {repo.language && <p className="text-xs mt-1" style={{ color: "#999" }}>{repo.language} · ⭐ {repo.stars}</p>}
                    </div>
                )}
                <div>
                    <p className="text-xs mb-2 uppercase tracking-widest" style={{ color: "#666" }}>Builds with</p>
                    <div className="flex flex-wrap gap-2">
                        {(developer.primaryStack as string[]).slice(0, 4).map(lang => (
                            <span key={lang} className="text-xs font-medium px-2.5 py-1 rounded-full"
                                style={{ background: `${LANG_COLORS[lang] || accent}15`, color: LANG_COLORS[lang] || accent, border: `1px solid ${LANG_COLORS[lang] || accent}40` }}>
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mt-auto">
                    <span className="text-xs" style={{ color: "#666" }}>Repos: </span>
                    <span className="text-xs font-bold" style={{ color: accent }}>{repos.length} public projects</span>
                </div>
            </>
        );
    }

    if (mode === "hackathon") {
        return (
            <>
                <div className="p-3 rounded-xl" style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>⚡ Battle Stats</p>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-xl font-black" style={{ color: accent }}>{repos.length}</p>
                            <p className="text-xs" style={{ color: "#888" }}>Projects</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black" style={{ color: accent }}>{repos.reduce((s, r) => s + r.stars, 0)}</p>
                            <p className="text-xs" style={{ color: "#888" }}>Stars</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black" style={{ color: accent }}>{new Set(repos.map(r => r.language).filter(Boolean)).size}</p>
                            <p className="text-xs" style={{ color: "#888" }}>Languages</p>
                        </div>
                    </div>
                </div>
                <div>
                    <p className="text-xs mb-2 uppercase tracking-widest" style={{ color: "#666" }}>Weapons of choice</p>
                    <div className="flex flex-wrap gap-2">
                        {(developer.primaryStack as string[]).slice(0, 5).map(lang => (
                            <span key={lang} className="text-xs font-black px-2.5 py-1 rounded-full"
                                style={{ background: `${LANG_COLORS[lang] || accent}20`, color: LANG_COLORS[lang] || accent, border: `1px solid ${LANG_COLORS[lang] || accent}50` }}>
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    if (mode === "learning") {
        const stack = developer.primaryStack as string[];
        const teach = stack.slice(0, 2);
        const learn = stack.slice(-2).filter(l => !teach.includes(l));
        return (
            <>
                <div className="flex flex-col gap-2">
                    <div className="p-2.5 rounded-xl" style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}>
                        <p className="text-xs font-bold mb-1.5" style={{ color: accent }}>🎓 Can Teach</p>
                        <div className="flex flex-wrap gap-1.5">
                            {teach.length > 0 ? teach.map(l => (
                                <span key={l} className="text-xs font-medium px-2 py-0.5 rounded-full"
                                    style={{ background: `${accent}20`, color: accent }}>
                                    {l}
                                </span>
                            )) : <span className="text-xs" style={{ color: "#666" }}>Ask them!</span>}
                        </div>
                    </div>
                    <div className="p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-xs font-bold mb-1.5" style={{ color: "#a0a0a0" }}>📖 Currently Exploring</p>
                        <div className="flex flex-wrap gap-1.5">
                            {learn.length > 0 ? learn.map(l => (
                                <span key={l} className="text-xs font-medium px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(255,255,255,0.06)", color: "#ccc" }}>
                                    {l}
                                </span>
                            )) : <span className="text-xs" style={{ color: "#666" }}>Open to everything!</span>}
                        </div>
                    </div>
                </div>
                {developer.bio && (
                    <p className="text-xs leading-relaxed line-clamp-2 mt-auto" style={{ color: "#888" }}>{developer.bio}</p>
                )}
            </>
        );
    }

    if (mode === "dating") {
        const personality = getCoderPersonality(developer);
        return (
            <>
                <div className="p-3 rounded-2xl text-center" style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}>
                    <p className="text-2xl mb-1">✨</p>
                    <p className="text-sm font-bold" style={{ color: accent }}>Coder Personality</p>
                    <p className="text-base font-black text-white mt-1">{personality}</p>
                </div>
                {developer.bio && (
                    <p className="text-sm leading-relaxed line-clamp-2 text-center italic" style={{ color: "#a0a0a0" }}>
                        "{developer.bio}"
                    </p>
                )}
                <div className="mt-auto flex justify-center gap-2">
                    {(developer.primaryStack as string[]).slice(0, 3).map(lang => (
                        <span key={lang} className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: `${LANG_COLORS[lang] || accent}15`, color: LANG_COLORS[lang] || accent }}>
                            {lang}
                        </span>
                    ))}
                </div>
            </>
        );
    }

    // Casual (default)
    return (
        <>
            {developer.bio && (
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "#a0a0a0" }}>{developer.bio}</p>
            )}
            <div>
                <p className="text-xs mb-2 uppercase tracking-widest" style={{ color: "#666" }}>Vibes with</p>
                <div className="flex flex-wrap gap-2">
                    {(developer.primaryStack as string[]).map(lang => (
                        <span key={lang} className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: `${LANG_COLORS[lang] || accent}20`, color: LANG_COLORS[lang] || accent, border: `1px solid ${LANG_COLORS[lang] || accent}40` }}>
                            {lang}
                        </span>
                    ))}
                </div>
            </div>
            <div className="mt-auto flex items-center gap-2">
                <span className="text-lg">🎮</span>
                <span className="text-xs" style={{ color: "#666" }}>{repos.length} repos · {repos.reduce((s, r) => s + r.stars, 0)} stars</span>
            </div>
        </>
    );
}

export function SwipeCard({ developer, onSwipe, isTop, stackIndex, intentConfig }: SwipeCardProps) {
    const likeLabel = intentConfig?.likeLabel || "CONNECT";
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-12, 12]);
    const likeOpacity = useTransform(x, [30, 110], [0, 1]);
    const passOpacity = useTransform(x, [-110, -30], [1, 0]);
    const cardRef = useRef<HTMLDivElement>(null);
    const accent = intentConfig.accentColor;
    const headerGradient = HEADER_GRADIENTS[intentConfig.id] || HEADER_GRADIENTS.casual;

    async function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
        const threshold = 110;
        if (info.offset.x > threshold) {
            await animate(x, 650, { duration: 0.35, ease: "easeOut" });
            onSwipe(developer.id, "like");
        } else if (info.offset.x < -threshold) {
            await animate(x, -650, { duration: 0.35, ease: "easeOut" });
            onSwipe(developer.id, "pass");
        } else {
            animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        }
    }

    const scoreColor = getScoreColor(developer.compatibilityScore);

    return (
        <motion.div
            ref={cardRef}
            style={{
                x, rotate,
                position: "absolute",
                width: "100%",
                height: "100%",
                top: `${stackIndex * 10}px`,
                scale: isTop ? 1 : 1 - stackIndex * 0.04,
                zIndex: 10 - stackIndex,
                cursor: isTop ? "grab" : "default",
                transformOrigin: "bottom center",
                background: "var(--bg-surface, #161620)",
                borderRadius: "var(--radius-xl, 1.5rem)",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: "grabbing" }}
        >
            {/* Like stamp */}
            {isTop && (
                <motion.div style={{
                    opacity: likeOpacity,
                    position: "absolute", top: 24, left: 20, zIndex: 20,
                    transform: "rotate(-18deg)",
                    border: "3px solid #22C55E",
                    color: "#22C55E",
                    fontWeight: 900, fontSize: "1.3rem",
                    padding: "0.2rem 0.9rem",
                    borderRadius: "var(--radius-md)",
                    pointerEvents: "none",
                    letterSpacing: "0.05em",
                    boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                    background: "rgba(34,197,94,0.08)",
                    backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                    <Heart size={16} fill="currentColor" />
                    {likeLabel}
                </motion.div>
            )}
            {/* Nope stamp */}
            {isTop && (
                <motion.div style={{
                    opacity: passOpacity,
                    position: "absolute", top: 24, right: 20, zIndex: 20,
                    transform: "rotate(18deg)",
                    border: "3px solid #EF4444",
                    color: "#EF4444",
                    fontWeight: 900, fontSize: "1.3rem",
                    padding: "0.2rem 0.9rem",
                    borderRadius: "var(--radius-md)",
                    pointerEvents: "none",
                    letterSpacing: "0.05em",
                    boxShadow: "0 0 20px rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.08)",
                    backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                    <X size={16} strokeWidth={2.5} />
                    NOPE
                </motion.div>
            )}

            {/* Card Content */}
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Hero image area */}
                <div style={{
                    position: "relative",
                    height: "55%",
                    flexShrink: 0,
                    overflow: "hidden",
                }}>
                    {/* Avatar as full-bleed image */}
                    <img
                        src={developer.avatarUrl || `https://ui-avatars.com/api/?name=${developer.username}&background=161620&color=E879F9&size=400&bold=true`}
                        alt={developer.username}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                    {/* Gradient overlay */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(9,9,14,0.95) 100%)",
                    }} />

                    {/* Match % badge */}
                    <div style={{
                        position: "absolute", top: 14, right: 14,
                        padding: "0.3rem 0.7rem",
                        borderRadius: "var(--radius-full)",
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(12px)",
                        border: `1px solid ${scoreColor}40`,
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        boxShadow: `0 0 12px ${scoreColor}30`,
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }} />
                        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: scoreColor }}>{developer.compatibilityScore}% Match</span>
                    </div>

                    {/* Location overlay on image */}
                    {developer.location && (
                        <div style={{
                            position: "absolute", bottom: 12, left: 14,
                            display: "flex", alignItems: "center", gap: "0.3rem",
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "0.78rem", fontWeight: 500,
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E", flexShrink: 0 }} />
                            <MapPin size={12} />
                            {developer.location}
                        </div>
                    )}
                </div>
                {/* Card body */}
                <div style={{
                    flex: 1,
                    padding: "1.1rem 1.25rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    overflow: "hidden",
                }}>
                    {/* Name & username */}
                    <div>
                        <h2 style={{
                            fontSize: "1.3rem",
                            fontWeight: 900,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                        }}>
                            {developer.name || developer.username}
                        </h2>
                        <p style={{ fontSize: "0.82rem", color: "var(--accent-light)", fontWeight: 600, marginTop: "0.15rem" }}>
                            @{developer.username}
                        </p>
                    </div>

                    {/* Bio */}
                    {developer.bio && (
                        <p style={{
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.55,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}>
                            {developer.bio}
                        </p>
                    )}

                    {/* Tech stack */}
                    {developer.primaryStack.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "auto" }}>
                            {developer.primaryStack.slice(0, 5).map((lang) => {
                                const color = LANG_COLORS[lang] || "#7E7D96";
                                return (
                                    <span key={lang} style={{
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        padding: "0.25rem 0.6rem",
                                        borderRadius: "var(--radius-full)",
                                        background: `${color}15`,
                                        color: color,
                                        border: `1px solid ${color}30`,
                                        display: "flex", alignItems: "center", gap: "0.3rem",
                                    }}>
                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
                                        {lang}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

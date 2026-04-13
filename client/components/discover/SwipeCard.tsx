"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef } from "react";
import { IntentConfig } from "@/lib/intentConfig";

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
    JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572a5",
    Go: "#00add8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
    Ruby: "#701516", Swift: "#fa7343", Kotlin: "#a97bff", CSS: "#563d7c",
    HTML: "#e34c26", Shell: "#89e051", Dart: "#00B4AB", PHP: "#777bb4",
};

// Deterministic "personality" from GitHub stats
function getCoderPersonality(dev: Developer): string {
    const repos = dev.repositories || [];
    const totalStars = repos.reduce((s, r) => s + r.stars, 0);
    const langCount = new Set(repos.map(r => r.language).filter(Boolean)).size;
    if (totalStars > 100) return "⭐ Open Source Legend";
    if (langCount > 5) return "🌐 Polyglot Hacker";
    if (repos.length > 20) return "🏃 Prolific Builder";
    if (repos.some(r => (r.topics as string[]).includes("machine-learning"))) return "🤖 AI Enthusiast";
    if (dev.bio?.toLowerCase().includes("student")) return "🎓 Student Developer";
    return "🛠️ Craftsman Coder";
}

// Best repo to feature for collab mode
function getFeaturedRepo(dev: Developer) {
    const repos = dev.repositories || [];
    return repos.sort((a, b) => b.stars - a.stars)[0] || null;
}

// Card header gradient per mode
const HEADER_GRADIENTS: Record<string, string> = {
    networking: "linear-gradient(135deg, rgba(37,99,235,0.7), rgba(17,50,130,0.8))",
    collab:     "linear-gradient(135deg, rgba(109,40,217,0.7), rgba(60,20,120,0.8))",
    hackathon:  "linear-gradient(135deg, rgba(217,119,6,0.7), rgba(120,53,15,0.8))",
    learning:   "linear-gradient(135deg, rgba(5,150,105,0.7), rgba(6,78,59,0.8))",
    dating:     "linear-gradient(135deg, rgba(219,39,119,0.7), rgba(131,24,67,0.8))",
    casual:     "linear-gradient(135deg, rgba(124,58,237,0.7), rgba(6,182,212,0.5))",
};

// Body-specific info section per mode
function ModeBody({ developer, intentConfig }: { developer: Developer; intentConfig: IntentConfig }) {
    const accent = intentConfig.accentColor;
    const mode = intentConfig.id;
    const repos = developer.repositories || [];

    if (mode === "networking") {
        const totalStars = repos.reduce((s, r) => s + r.stars, 0);
        const langCount  = new Set(repos.map(r => r.language).filter(Boolean)).size;
        const stack      = (developer.primaryStack as string[]);

        // Detect professional signals from bio
        const bio = (developer.bio || "").toLowerCase();
        const signals: string[] = [];
        if (bio.includes("open source") || bio.includes("opensource")) signals.push("🌍 Open Source");
        if (bio.includes("freelanc")) signals.push("💼 Freelance");
        if (bio.includes("mentor"))   signals.push("🎓 Mentor");
        if (bio.includes("hire") || bio.includes("looking for")) signals.push("🟢 Open to Work");
        if (bio.includes("student"))  signals.push("📚 Student");
        if (signals.length === 0)     signals.push("💡 Building");

        return (
            <>
                {/* Professional Stats Row */}
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "0.4rem", padding: "0.75rem",
                    borderRadius: "0.75rem",
                    background: `${accent}0d`,
                    border: `1px solid ${accent}20`,
                }}>
                    {[
                        { label: "Projects", value: repos.length },
                        { label: "Stars",    value: totalStars },
                        { label: "Languages",value: langCount },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "1.3rem", fontWeight: 900, color: accent, lineHeight: 1 }}>{value}</p>
                            <p style={{ fontSize: "0.6rem", color: "#666", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Primary Expertise — language dots + name */}
                <div>
                    <p style={{ fontSize: "0.65rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                        Primary Expertise
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {stack.slice(0, 5).map(lang => (
                            <span key={lang} style={{
                                display: "flex", alignItems: "center", gap: "0.3rem",
                                fontSize: "0.72rem", fontWeight: 600,
                                padding: "0.25rem 0.65rem", borderRadius: "0.4rem",
                                background: `${LANG_COLORS[lang] || accent}12`,
                                color: LANG_COLORS[lang] || accent,
                                border: `1px solid ${LANG_COLORS[lang] || accent}35`,
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: LANG_COLORS[lang] || accent, flexShrink: 0 }} />
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Simulated Barcode */}
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", flex: 1 }}>
                        {signals.slice(0, 3).map(s => (
                            <span key={s} style={{
                                fontSize: "0.65rem", fontWeight: 700,
                                padding: "0.2rem 0.55rem", borderRadius: "999px",
                                background: "rgba(255,255,255,0.05)",
                                color: "#888", border: "1px solid rgba(255,255,255,0.1)",
                            }}>{s}</span>
                        ))}
                    </div>
                    {/* Barcode graphic */}
                    <div style={{ 
                        fontFamily: "'Libre Barcode 39', monospace", 
                        fontSize: "1.7rem", 
                        color: `${accent}80`,
                        opacity: 0.6,
                        height: "30px",
                        overflow: "hidden",
                        letterSpacing: "2px",
                        transform: "scaleY(1.5)",
                        transformOrigin: "bottom"
                    }}>
                        ||||| ||| || ||| ||
                    </div>
                </div>
            </>
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
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-20, 20]);
    const likeOpacity = useTransform(x, [30, 120], [0, 1]);
    const passOpacity = useTransform(x, [-120, -30], [1, 0]);
    const cardRef = useRef<HTMLDivElement>(null);
    const accent = intentConfig.accentColor;
    const headerGradient = HEADER_GRADIENTS[intentConfig.id] || HEADER_GRADIENTS.casual;

    async function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
        const threshold = 120;
        if (info.offset.x > threshold) {
            await animate(x, 600, { duration: 0.3 });
            onSwipe(developer.id, "like");
        } else if (info.offset.x < -threshold) {
            await animate(x, -600, { duration: 0.3 });
            onSwipe(developer.id, "pass");
        } else {
            animate(x, 0, { type: "spring", stiffness: 300 });
        }
    }

    return (
        <motion.div
            ref={cardRef}
            style={{
                x, rotate,
                position: "absolute",
                width: "100%",
                height: "100%",
                top: `${stackIndex * 8}px`,
                scale: isTop ? 1 : 0.96 - stackIndex * 0.02,
                zIndex: 10 - stackIndex,
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
        >
            {/* Like stamp */}
            {isTop && (
                <motion.div
                    style={{ opacity: likeOpacity, border: `3px solid ${accent}`, color: accent } as any}
                    className="absolute top-5 left-5 z-20 rotate-[-22deg] text-2xl font-black px-3 py-1 rounded-xl pointer-events-none"
                >
                    {intentConfig.likeLabel}
                </motion.div>
            )}
            {/* Pass stamp */}
            {isTop && (
                <motion.div
                    style={{ opacity: passOpacity, border: "3px solid #ef4444", color: "#ef4444" } as any}
                    className="absolute top-5 right-5 z-20 rotate-[22deg] text-2xl font-black px-3 py-1 rounded-xl pointer-events-none"
                >
                    NOPE
                </motion.div>
            )}

            <div className="w-full h-full flex flex-col overflow-hidden select-none relative"
                style={{ 
                    background: intentConfig.id === "networking" ? `linear-gradient(145deg, #16181d 0%, #0d0f12 100%)` : "var(--bg-card)", 
                    border: `1px solid ${accent}20`, 
                    borderRadius: "1.25rem", 
                    boxShadow: intentConfig.id === "networking" 
                        ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 2px ${accent}30, inset 0 0 20px ${accent}10` 
                        : `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accent}10` 
                }}>

                {/* Networking ID Card Exclusives */}
                {intentConfig.id === "networking" && (
                    <>
                        {/* Animated Holographic Scan Line */}
                        <motion.div
                            animate={{ top: ["-10%", "110%", "-10%"] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            style={{
                                position: "absolute",
                                left: 0, right: 0,
                                height: "8px",
                                background: `linear-gradient(to bottom, transparent, ${accent}80, transparent)`,
                                boxShadow: `0 0 15px ${accent}, 0 0 30px ${accent}50`,
                                zIndex: 30,
                                pointerEvents: "none",
                                opacity: 0.3
                            }}
                        />
                        {/* Lanyard Hole */}
                        <div style={{
                            position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
                            width: 60, height: 12, borderRadius: 10,
                            background: "#000", border: `1px solid ${accent}40`,
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
                            zIndex: 30
                        }} />
                    </>
                )}

                {/* Card Header */}
                <div className="relative h-40 flex items-end p-4 shrink-0" style={{ background: headerGradient }}>
                    {/* Mode badge top-left / compatibility */}
                    <div className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold"
                        style={{ background: intentConfig.id === "networking" ? "rgba(0,0,0,0.6)" : `${accent}25`, color: accent, border: `1px solid ${accent}40`, backdropFilter: "blur(8px)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {intentConfig.id === "networking" ? `ID: DEV-${developer.id.substring(0,6)}` : <>{intentConfig.emoji} {intentConfig.label}</>}
                    </div>

                    <div className="absolute top-4 right-4 px-2.5 py-1 text-xs font-black rounded-md"
                        style={{ background: "rgba(0,0,0,0.6)", color: intentConfig.id === "networking" ? "#fbbf24" : accent, border: `1px solid ${intentConfig.id === "networking" ? "#fbbf24" : accent}40`, backdropFilter: "blur(8px)" }}>
                        {intentConfig.id === "networking" ? `MATCH: ${developer.compatibilityScore}%` : `${developer.compatibilityScore}% match`}
                    </div>

                    {/* Avatar + name */}
                    <div className="flex items-end gap-3 z-10 w-full">
                        <img
                            src={developer.avatarUrl || `https://ui-avatars.com/api/?name=${developer.username}&background=111&color=fff`}
                            alt={developer.username}
                            style={{ width: 64, height: 64, borderRadius: "0.875rem", border: `2px solid ${accent}60`, flexShrink: 0 }}
                        />
                        <div className="min-w-0">
                            <h2 className="text-lg font-black text-white truncate leading-tight uppercase font-mono">{developer.name || developer.username}</h2>
                            <p className="text-xs truncate font-mono mt-0.5" style={{ color: `${accent}cc` }}>HANDLE: @{developer.username}</p>
                            {developer.location && (
                                <p className="text-xs mt-0.5 truncate font-mono uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>LOC: {developer.location}</p>
                            )}
                        </div>
                        {/* Gold Microchip (Networking only) */}
                        {intentConfig.id === "networking" && (
                            <div style={{
                                position: "absolute", right: 20, bottom: 20,
                                width: 36, height: 28, borderRadius: 6,
                                background: "linear-gradient(135deg, #d4af37 0%, #aa8410 100%)",
                                border: "1px solid #7c620c",
                                display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignContent: "space-between", padding: 4,
                                opacity: 0.9,
                                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)"
                            }}>
                                <div style={{width: "8px", height: "1px", background: "rgba(0,0,0,0.2)"}}></div>
                                <div style={{width: "8px", height: "1px", background: "rgba(0,0,0,0.2)"}}></div>
                                <div style={{width: "100%", height: "8px", background: "rgba(0,0,0,0.1)", margin: "2px 0"}}></div>
                                <div style={{width: "8px", height: "1px", background: "rgba(0,0,0,0.2)"}}></div>
                                <div style={{width: "8px", height: "1px", background: "rgba(0,0,0,0.2)"}}></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Body — mode-specific */}
                <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
                    <ModeBody developer={developer} intentConfig={intentConfig} />
                </div>
            </div>
        </motion.div>
    );
}

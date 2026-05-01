"use client";
import { motion } from "framer-motion";
import { MapPin, Building2, Calendar, ExternalLink, GitBranch } from "lucide-react";

interface ProfileHeaderProps {
    avatarUrl: string | null;
    name: string | null;
    username: string;
    bio: string | null;
    location: string | null;
    intentMode: string | null;
    primaryStack: string[];
    githubStats: {
        followers: number;
        following: number;
        publicRepos: number;
        company?: string;
        blog?: string;
        twitterUsername?: string;
        githubUrl?: string;
        createdAt?: string;
    };
}

const INTENT_LABELS: Record<string, { label: string; emoji: string }> = {
    networking: { label: "Professional Networking", emoji: "💼" },
    collab:     { label: "Project Collaboration",   emoji: "🚀" },
    hackathon:  { label: "Hackathon Partner",       emoji: "⚡" },
    learning:   { label: "Learning Buddy",          emoji: "📚" },
    dating:     { label: "Dating Mode",             emoji: "💝" },
    casual:     { label: "Casual Dev Connect",      emoji: "🎮" },
};

const LANG_COLORS: Record<string, string> = {
    JavaScript: "#F7DF1E", TypeScript: "#3178C6", Python: "#3572A5",
    Go: "#00ADD8", Rust: "#DEA584", Java: "#B07219", "C++": "#F34B7D",
    Ruby: "#701516", Swift: "#FA7343", Kotlin: "#A97BFF",
    CSS: "#563D7C", HTML: "#E34C26", PHP: "#777BB4",
};

export default function ProfileHeader({
    avatarUrl, name, username, bio, location, intentMode, primaryStack, githubStats
}: ProfileHeaderProps) {
    const joinYear = githubStats.createdAt ? new Date(githubStats.createdAt).getFullYear() : null;
    const intent = intentMode ? INTENT_LABELS[intentMode] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-2xl)",
                overflow: "hidden",
                width: "100%",
            }}
        >
            {/* Banner — gradient mesh */}
            <div style={{
                height: 160,
                background: "linear-gradient(135deg, #1a0525 0%, #120730 30%, rgba(168,85,247,0.15) 60%, #0d1a2e 100%)",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Decorative orb */}
                <div style={{
                    position: "absolute", top: -60, right: -60,
                    width: 220, height: 220,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(192,38,211,0.25) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: -40, left: 60,
                    width: 160, height: 160,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
            </div>

            {/* Content */}
            <div style={{ padding: "0 1.75rem 1.75rem", position: "relative" }}>
                {/* Avatar overlapping banner */}
                <div style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    marginTop: -54,
                    marginBottom: "1.25rem",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                }}>
                    <div style={{ position: "relative" }}>
                        <img
                            src={avatarUrl || `https://ui-avatars.com/api/?name=${username}&background=161620&color=E879F9&size=200&bold=true`}
                            alt={username}
                            style={{
                                width: 108, height: 108,
                                borderRadius: "50%",
                                border: "4px solid var(--bg-surface)",
                                boxShadow: "0 0 0 2px var(--border-accent), 0 8px 32px rgba(0,0,0,0.4)",
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                        {/* Online dot */}
                        <span style={{
                            position: "absolute", bottom: 6, right: 6,
                            width: 16, height: 16,
                            background: "#22C55E",
                            borderRadius: "50%",
                            border: "3px solid var(--bg-surface)",
                            boxShadow: "0 0 8px rgba(34,197,94,0.5)",
                        }} />
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginTop: 60 }}>
                        {githubStats.githubUrl && (
                            <a
                                href={githubStats.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.4rem",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "var(--radius-md)",
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-strong)",
                                    color: "var(--text-primary)",
                                    textDecoration: "none",
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                    transition: "all 0.18s",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-sm)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                }}
                            >
                                <GitBranch size={14} />
                                GitHub
                                <ExternalLink size={11} style={{ opacity: 0.5 }} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: "0.75rem" }}>
                    <h1 style={{
                        fontSize: "1.6rem",
                        fontWeight: 900,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.025em",
                        marginBottom: "0.2rem",
                    }}>
                        {name || username}
                    </h1>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                        @{username}
                    </p>
                </div>

                {/* Bio */}
                {bio && (
                    <p style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.65,
                        marginBottom: "1rem",
                        maxWidth: 540,
                    }}>
                        {bio}
                    </p>
                )}

                {/* Meta chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.25rem" }}>
                    {location && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <MapPin size={13} style={{ opacity: 0.6 }} />
                            {location}
                        </span>
                    )}
                    {githubStats.company && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <Building2 size={13} style={{ opacity: 0.6 }} />
                            {githubStats.company}
                        </span>
                    )}
                    {joinYear && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <Calendar size={13} style={{ opacity: 0.6 }} />
                            Joined {joinYear}
                        </span>
                    )}
                    {intent && (
                        <span style={{
                            display: "flex", alignItems: "center", gap: "0.3rem",
                            padding: "0.2rem 0.65rem",
                            borderRadius: "var(--radius-full)",
                            background: "rgba(192,38,211,0.08)",
                            border: "1px solid var(--border-accent)",
                            color: "var(--accent-light)",
                            fontSize: "0.75rem", fontWeight: 700,
                        }}>
                            {intent.emoji} {intent.label}
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div style={{
                    display: "flex",
                    gap: "0",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    marginBottom: "1.25rem",
                }}>
                    {[
                        { label: "Repos",     value: githubStats.publicRepos || 0 },
                        { label: "Followers", value: githubStats.followers || 0 },
                        { label: "Following", value: githubStats.following || 0 },
                    ].map(({ label, value }, i) => (
                        <div key={label} style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "0.9rem 0.5rem",
                            borderRight: i < 2 ? "1px solid var(--border)" : "none",
                        }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                                {value.toLocaleString()}
                            </p>
                            <p className="section-label" style={{ marginTop: "0.2rem" }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Tech Stack */}
                {primaryStack.length > 0 && (
                    <div>
                        <p className="section-label" style={{ marginBottom: "0.65rem" }}>Tech Stack</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                            {primaryStack.map((lang) => {
                                const color = LANG_COLORS[lang] || "var(--accent-light)";
                                return (
                                    <span key={lang} style={{
                                        display: "flex", alignItems: "center", gap: "0.35rem",
                                        fontSize: "0.78rem", fontWeight: 700,
                                        padding: "0.3rem 0.75rem",
                                        borderRadius: "var(--radius-full)",
                                        background: `${color}12`,
                                        color: color,
                                        border: `1px solid ${color}30`,
                                    }}>
                                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                                        {lang}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

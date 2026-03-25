"use client";
import { motion } from "framer-motion";

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

const INTENT_LABELS: Record<string, string> = {
    networking: "Professional Networking",
    collab: "Project Collaboration",
    hackathon: "Hackathon Partner",
    learning: "Learning Buddy",
    dating: "Dating Mode",
    casual: "Casual Dev Connect",
};

const LANG_COLORS: Record<string, string> = {
    JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572a5",
    Go: "#00add8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
    Ruby: "#701516", Swift: "#fa7343", Kotlin: "#a97bff",
};

export default function ProfileHeader({ avatarUrl, name, username, bio, location, intentMode, primaryStack, githubStats }: ProfileHeaderProps) {
    const joinYear = githubStats.createdAt ? new Date(githubStats.createdAt).getFullYear() : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="gt-card"
            style={{
                overflow: "hidden",
                width: "100%",
                padding: 0,
            }}
        >
            {/* Banner */}
            <div style={{
                height: 140,
                background: "linear-gradient(135deg, #1e1e1e 0%, rgba(255,107,154,0.1) 50%, #1e1e1e 100%)",
                borderBottom: "1px solid var(--card-border)",
            }} />

            {/* Avatar + info */}
            <div style={{ padding: "0 1.75rem 1.75rem", position: "relative" }}>
                {/* Avatar overlapping banner */}
                <div style={{ position: "relative", marginTop: -50 }}>
                    <img
                        src={avatarUrl || `https://ui-avatars.com/api/?name=${username}\u0026background=242424\u0026color=FF6B9A\u0026size=128`}
                        alt={username}
                        style={{
                            width: 100, height: 100,
                            borderRadius: "1.25rem",
                            border: "4px solid var(--bg-card)",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                            objectFit: "cover",
                        }}
                    />
                </div>

                {/* Name */}
                <div style={{ marginTop: "1rem" }}>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{name || username}</h1>
                    <a
                        href={githubStats.githubUrl || `https://github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.95rem", color: "var(--accent-pink)", textDecoration: "none", fontWeight: 600 }}
                    >
                        @{username}
                    </a>
                </div>

                {/* Bio */}
                {bio && (
                    <p style={{ marginTop: "1rem", fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, opacity: 0.9 }}>
                        {bio}
                    </p>
                )}

                {/* Meta info */}
                <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {location && <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", opacity: 0.6 }}>📍 {location}</span>}
                    {githubStats.company && <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", opacity: 0.6 }}>🏢 {githubStats.company}</span>}
                    {joinYear && <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", opacity: 0.6 }}>📅 Joined {joinYear}</span>}
                </div>

                {/* GitHub Stats */}
                <div style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    gap: "2rem",
                    padding: "1.25rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "0.85rem",
                    border: "1px solid var(--card-border)",
                }}>
                    {[
                        { label: "Repos", value: githubStats.publicRepos || 0 },
                        { label: "Followers", value: githubStats.followers || 0 },
                        { label: "Following", value: githubStats.following || 0 },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>{value}</p>
                            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.5 }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Tech Stack */}
                {primaryStack.length > 0 && (
                    <div style={{ marginTop: "1.5rem" }}>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.75rem", opacity: 0.4 }}>
                            Top Stack
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {primaryStack.map((lang) => (
                                <span key={lang} style={{
                                    fontSize: "0.8rem", fontWeight: 600,
                                    padding: "0.35rem 0.85rem",
                                    borderRadius: "0.6rem",
                                    background: "rgba(255,255,255,0.03)",
                                    color: LANG_COLORS[lang] || "var(--accent-pink)",
                                    border: `1px solid ${(LANG_COLORS[lang] || "#FF6B9A") + "22"}`,
                                }}>{lang}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Intent badge */}
                {intentMode && (
                    <div style={{ marginTop: "1.5rem" }}>
                        <span style={{
                            fontSize: "0.8rem", fontWeight: 700,
                            padding: "0.4rem 1rem",
                            borderRadius: "0.6rem",
                            background: "rgba(255,107,154,0.08)",
                            color: "var(--accent-pink)",
                            border: "1px solid rgba(255,107,154,0.2)",
                            boxShadow: "0 0 15px var(--accent-glow)",
                        }}>
                            {INTENT_LABELS[intentMode] || intentMode}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

"use client";
import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink } from "lucide-react";

interface Repo {
    id: string;
    repoName: string;
    language: string | null;
    stars: number;
    forks: number;
    topics: string[];
}

interface RepoCardProps {
    repo: Repo;
    index: number;
    username: string;
}

const LANG_COLORS: Record<string, string> = {
    JavaScript: "#F7DF1E", TypeScript: "#3178C6", Python: "#3572A5",
    Go: "#00ADD8", Rust: "#DEA584", Java: "#B07219", "C++": "#F34B7D",
    Ruby: "#701516", Swift: "#FA7343", Kotlin: "#A97BFF",
    CSS: "#563D7C", HTML: "#E34C26", PHP: "#777BB4",
};

export default function RepoCard({ repo, index, username }: RepoCardProps) {
    const langColor = LANG_COLORS[repo.language || ""] || "var(--accent-light)";

    return (
        <motion.a
            href={`https://github.com/${username}/${repo.repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            style={{
                display: "block",
                textDecoration: "none",
                padding: "1.1rem 1.25rem",
                borderRadius: "var(--radius-xl)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                transition: "all 0.22s ease",
                position: "relative",
                overflow: "hidden",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-sm), var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
        >
            {/* Left accent bar */}
            <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                background: `linear-gradient(to bottom, ${langColor}, transparent)`,
                borderRadius: "2px 0 0 2px",
            }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.6rem" }}>
                <p style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--accent-light)",
                    wordBreak: "break-word" as const,
                    letterSpacing: "-0.01em",
                }}>
                    {repo.repoName}
                </p>
                <ExternalLink size={13} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
            </div>

            {/* Topics */}
            {repo.topics.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
                    {repo.topics.slice(0, 3).map((t) => (
                        <span key={t} style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "var(--radius-full)",
                            background: "var(--bg-elevated)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                        }}>
                            {t}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {repo.language && (
                    <span style={{
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        fontSize: "0.78rem", color: langColor, fontWeight: 600,
                    }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: langColor, display: "inline-block" }} />
                        {repo.language}
                    </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    <Star size={12} style={{ opacity: 0.6 }} />
                    {repo.stars}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    <GitFork size={12} style={{ opacity: 0.6 }} />
                    {repo.forks}
                </span>
            </div>
        </motion.a>
    );
}

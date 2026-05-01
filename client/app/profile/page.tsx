"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { FolderGit2, Info, RefreshCw, ExternalLink } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import RepoCard from "@/components/profile/RepoCard";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"repos" | "about">("repos");

    useEffect(() => { if (status === "unauthenticated") router.replace("/"); }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;

        async function loadProfile() {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/users/me/full`, { timeout: 8000 });
                setProfile(res.data);
            } catch {
                try {
                    const username = (session as any)?.user?.username || (session as any)?.user?.name;
                    const accessToken = (session as any)?.accessToken;
                    if (!username) throw new Error("No username");
                    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
                    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
                    const [ghUser, ghRepos] = await Promise.all([
                        axios.get(`https://api.github.com/users/${username}`, { headers }),
                        axios.get(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`, { headers }),
                    ]);
                    const g = ghUser.data;
                    const repos = ghRepos.data
                        .filter((r: any) => !r.fork)
                        .map((r: any) => ({ id: r.id.toString(), repoName: r.name, language: r.language, stars: r.stargazers_count, forks: r.forks_count, topics: r.topics || [] }))
                        .sort((a: any, b: any) => b.stars - a.stars);
                    const langCount: Record<string, number> = {};
                    repos.forEach((r: any) => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
                    const primaryStack = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([l]) => l);
                    setProfile({
                        username: g.login, name: g.name, avatarUrl: g.avatar_url, bio: g.bio,
                        location: g.location, primaryStack, intentMode: null, repositories: repos,
                        githubStats: {
                            followers: g.followers, following: g.following, publicRepos: g.public_repos,
                            publicGists: g.public_gists, company: g.company, blog: g.blog,
                            twitterUsername: g.twitter_username, createdAt: g.created_at, githubUrl: g.html_url,
                        },
                    });
                } catch {
                    setError("Could not load profile. Make sure both servers are running.");
                }
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [status, session]);

    if (status === "loading" || loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{
                        textAlign: "center", padding: "3rem 2rem",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-2xl)",
                        maxWidth: 400,
                    }}>
                        <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</p>
                        <p style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                            Profile load failed
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.55 }}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                padding: "0.65rem 1.5rem",
                                background: "linear-gradient(135deg, var(--accent), var(--accent-alt))",
                                color: "white", border: "none",
                                borderRadius: "var(--radius-md)", cursor: "pointer",
                                fontWeight: 700, fontFamily: "inherit", fontSize: "0.875rem",
                                margin: "0 auto",
                                boxShadow: "0 4px 16px var(--accent-glow)",
                            }}
                        >
                            <RefreshCw size={15} />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const { repositories = [], githubStats = {}, ...user } = profile;

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
            <Navbar />

            <main style={{ maxWidth: 800, margin: "0 auto", width: "100%", padding: "2rem 1.25rem 4rem" }}>
                <ProfileHeader
                    avatarUrl={user.avatarUrl}
                    name={user.name}
                    username={user.username}
                    bio={user.bio}
                    location={user.location}
                    intentMode={user.intentMode}
                    primaryStack={user.primaryStack || []}
                    githubStats={githubStats}
                />

                {/* Tabs */}
                <div style={{
                    display: "flex",
                    gap: "0.25rem",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "0.3rem",
                    marginTop: "1.5rem",
                    marginBottom: "1.25rem",
                    width: "fit-content",
                }}>
                    {([
                        { id: "repos", label: `Repositories (${repositories.length})`, icon: FolderGit2 },
                        { id: "about", label: "About",                                   icon: Info },
                    ] as const).map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            style={{
                                padding: "0.45rem 1.1rem",
                                borderRadius: "var(--radius-md)",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                fontFamily: "inherit",
                                transition: "all 0.2s ease",
                                background: activeTab === id ? "linear-gradient(135deg, var(--accent), var(--accent-alt))" : "transparent",
                                color: activeTab === id ? "white" : "var(--text-secondary)",
                                boxShadow: activeTab === id ? "0 2px 12px var(--accent-glow)" : "none",
                                display: "flex", alignItems: "center", gap: "0.4rem",
                            }}
                        >
                            <Icon size={13} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Repos tab */}
                {activeTab === "repos" && (
                    repositories.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                textAlign: "center",
                                padding: "4rem 2rem",
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius-2xl)",
                                color: "var(--text-secondary)",
                            }}
                        >
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                            <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1.05rem", marginBottom: "0.4rem" }}>
                                No repositories yet
                            </p>
                            <p style={{ fontSize: "0.875rem", lineHeight: 1.55 }}>
                                Push your first project to GitHub and it will appear here.
                            </p>
                        </motion.div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "0.75rem",
                        }}>
                            {repositories.map((repo: any, i: number) => (
                                <RepoCard key={repo.id} repo={repo} index={i} username={user.username} />
                            ))}
                        </div>
                    )
                )}

                {/* About tab */}
                {activeTab === "about" && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-xl)",
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.85rem",
                        }}
                    >
                        {[
                            { label: "GitHub", value: githubStats.githubUrl, link: true },
                            { label: "Website", value: githubStats.blog, link: true },
                            { label: "Twitter / X", value: githubStats.twitterUsername ? `@${githubStats.twitterUsername}` : null, link: false },
                            { label: "Company", value: githubStats.company, link: false },
                            { label: "Location", value: user.location, link: false },
                            { label: "Looking for", value: user.intentMode, link: false },
                            { label: "Public Gists", value: githubStats.publicGists, link: false },
                        ].filter(({ value }) => value).map(({ label, value, link }) => (
                            <div key={label} style={{
                                display: "flex", gap: "1rem", alignItems: "flex-start",
                                paddingBottom: "0.85rem",
                                borderBottom: "1px solid var(--border)",
                            }}>
                                <span className="section-label" style={{ minWidth: 110, paddingTop: "0.1rem" }}>{label}</span>
                                {link ? (
                                    <a
                                        href={String(value).startsWith("http") ? String(value) : `https://${value}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{
                                            fontSize: "0.875rem", color: "var(--accent-light)",
                                            textDecoration: "none", fontWeight: 600,
                                            display: "flex", alignItems: "center", gap: "0.3rem",
                                        }}
                                    >
                                        {String(value)}
                                        <ExternalLink size={11} style={{ opacity: 0.6 }} />
                                    </a>
                                ) : (
                                    <span style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{String(value)}</span>
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
}

// fix missing import


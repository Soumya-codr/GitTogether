"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
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
            } catch (err: any) {
                // Fallback: build profile directly from NextAuth session + GitHub API
                try {
                    const username = (session as any)?.user?.username || (session as any)?.user?.name;
                    const accessToken = (session as any)?.accessToken;

                    if (!username) throw new Error("No username");

                    // Fetch GitHub profile directly
                    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
                    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

                    const [ghUser, ghRepos] = await Promise.all([
                        axios.get(`https://api.github.com/users/${username}`, { headers }),
                        axios.get(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`, { headers }),
                    ]);

                    const g = ghUser.data;
                    const repos = ghRepos.data
                        .filter((r: any) => !r.fork)
                        .map((r: any) => ({
                            id: r.id.toString(),
                            repoName: r.name,
                            language: r.language,
                            stars: r.stargazers_count,
                            forks: r.forks_count,
                            topics: r.topics || [],
                        }))
                        .sort((a: any, b: any) => b.stars - a.stars);

                    // Compute primary stack
                    const langCount: Record<string, number> = {};
                    repos.forEach((r: any) => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
                    const primaryStack = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l);

                    setProfile({
                        username: g.login,
                        name: g.name,
                        avatarUrl: g.avatar_url,
                        bio: g.bio,
                        location: g.location,
                        primaryStack,
                        intentMode: null,
                        repositories: repos,
                        githubStats: {
                            followers: g.followers,
                            following: g.following,
                            publicRepos: g.public_repos,
                            publicGists: g.public_gists,
                            company: g.company,
                            blog: g.blog,
                            twitterUsername: g.twitter_username,
                            createdAt: g.created_at,
                            githubUrl: g.html_url,
                        },
                    });
                } catch (fallbackErr: any) {
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
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>😕</p>
                        <p style={{ fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>Profile load failed</p>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{ padding: "0.6rem 1.4rem", background: "linear-gradient(135deg,#e8614a,#d44a34)", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600 }}
                        >
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
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <main style={{ maxWidth: 740, margin: "0 auto", width: "100%", padding: "2rem 1rem" }}>

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
                    marginTop: "1.5rem",
                    marginBottom: "1rem",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "0.6rem",
                    padding: 3,
                }}>
                    {(["repos", "about"] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            flex: 1,
                            padding: "0.55rem",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            border: "none",
                            borderRadius: "0.4rem",
                            cursor: "pointer",
                            transition: "all 0.18s",
                            background: activeTab === tab ? "linear-gradient(135deg, #e8614a, #d44a34)" : "transparent",
                            color: activeTab === tab ? "white" : "var(--muted)",
                        }}>
                            {tab === "repos" ? `📁 Repositories (${repositories.length})` : "ℹ️ About"}
                        </button>
                    ))}
                </div>

                {activeTab === "repos" && (
                    repositories.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", fontSize: "0.9rem" }}>
                            No repositories found.
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "0.75rem" }}>
                            {repositories.map((repo: any, i: number) => (
                                <RepoCard key={repo.id} repo={repo} index={i} username={user.username} />
                            ))}
                        </div>
                    )
                )}

                {activeTab === "about" && (
                    <div style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.875rem",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}>
                        {[
                            { label: "GitHub", value: githubStats.githubUrl, link: true },
                            { label: "Website", value: githubStats.blog, link: true },
                            { label: "Twitter / X", value: githubStats.twitterUsername ? `@${githubStats.twitterUsername}` : null, link: false },
                            { label: "Company", value: githubStats.company, link: false },
                            { label: "Location", value: user.location, link: false },
                            { label: "Looking for", value: user.intentMode, link: false },
                            { label: "Public Gists", value: githubStats.publicGists, link: false },
                        ].filter(({ value }) => value).map(({ label, value, link }) => (
                            <div key={label} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "0.8rem", color: "var(--muted)", minWidth: 110 }}>{label}</span>
                                {link ? (
                                    <a href={String(value).startsWith("http") ? String(value) : `https://${value}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ fontSize: "0.875rem", color: "#e8614a", textDecoration: "none" }}>
                                        {String(value)}
                                    </a>
                                ) : (
                                    <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)" }}>{String(value)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

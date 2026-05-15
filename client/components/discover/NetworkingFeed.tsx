"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
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
    repositories?: { repoName: string; stars: number; language: string | null; topics: string[] }[];
}

interface NetworkingFeedProps {
    deck: Developer[];
    onConnect: (targetId: string, type: "like") => void;
    intentConfig: IntentConfig;
}

export default function NetworkingFeed({ deck, onConnect, intentConfig }: NetworkingFeedProps) {
    const { data: session } = useSession();
    const user = session?.user as any;
    
    // Track clicked button states for immediate feedback
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

    const handleConnect = (devId: string) => {
        setPendingIds(prev => new Set(prev).add(devId));
        // Call the parent handler after a tiny delay for UX (shows button animation)
        setTimeout(() => {
            onConnect(devId, "like");
        }, 500);
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
            
            {/* Left Sidebar - Mini Profile */}
            <aside style={{ width: "16rem", flexShrink: 0 }}>
                <div style={{ backgroundColor: "#18181A", borderRadius: "0.75rem", border: "1px solid #1f2937", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", position: "sticky", top: "6rem" }}>
                    {/* Banner */}
                    <div style={{ height: "60px", background: "linear-gradient(to right, #374151, #4b5563)" }} />
                    {/* Profile content */}
                    <div style={{ padding: "0 1rem 1rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "-32px" }}>
                        <img 
                            src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || "User"}`} 
                            alt="Profile" 
                            style={{ 
                                width: "64px", height: "64px", borderRadius: "50%", 
                                border: "3px solid #18181A", objectFit: "cover",
                                display: "block"
                            }}
                        />
                        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                            {user?.name || user?.username || "Developer"}
                        </h3>
                        <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.25rem" }}>Building the future</p>
                        <div style={{ width: "100%", borderTop: "1px solid #1f2937", marginTop: "0.75rem", paddingTop: "0.75rem" }}>
                            <p style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem" }}>Intent Mode</p>
                            <span style={{ padding: "0.25rem 0.5rem", backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa", fontSize: "0.75rem", fontWeight: 700, borderRadius: "9999px" }}>
                                {intentConfig.emoji} {intentConfig.label}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Feed */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem", paddingBottom: "5rem" }}>
                <h2 style={{ display: "none" }}>FIXED VERSION</h2>
                {deck.map((dev) => {
                    const repos = dev.repositories || [];
                    const totalStars = repos.reduce((s, r) => s + r.stars, 0);
                    const isPending = pendingIds.has(dev.id);

                    return (
                        <div key={dev.id} className="rounded-xl border border-gray-800 overflow-hidden shadow-lg transition-opacity duration-300" style={{ backgroundColor: "#18181A", opacity: isPending ? 0.6 : 1, display: "flex", flexDirection: "column" }}>
                            <div style={{ padding: "1rem", display: "flex", gap: "1rem" }}>
                                <img 
                                    onClick={() => window.open(`https://github.com/${dev.username}`, '_blank')}
                                    src={dev.avatarUrl || `https://ui-avatars.com/api/?name=${dev.username}`} 
                                    alt={dev.username} 
                                    style={{ 
                                        width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                                        cursor: "pointer", transition: "transform 0.2s"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                                />
                                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                                        <div style={{ flex: 1, minWidth: 0, paddingRight: "0.5rem" }}>
                                            <h2 
                                                onClick={() => window.open(`https://github.com/${dev.username}`, '_blank')}
                                                className="text-base font-bold text-white hover:text-blue-400 cursor-pointer transition-colors" 
                                                style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}
                                            >
                                                {dev.name || dev.username}
                                            </h2>
                                            <p className="text-xs text-gray-400" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "0.125rem 0 0 0" }}>{dev.bio || "Software Engineer"}</p>
                                            <p className="text-xs text-gray-500" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "0.125rem 0 0 0" }}>{dev.location || "Earth"} · <span className="text-blue-400 font-semibold">{dev.compatibilityScore}% Match</span></p>
                                        </div>
                                        <button 
                                            onClick={() => handleConnect(dev.id)}
                                            disabled={isPending}
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors shrink-0 ${
                                                isPending 
                                                    ? "bg-gray-700 text-gray-400 border-gray-700" 
                                                    : "bg-transparent text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                                            }`}
                                        >
                                            {isPending ? "Pending..." : "Connect"}
                                        </button>
                                    </div>

                                    {/* Highlights */}
                                    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #1f2937", display: "flex", gap: "1.5rem" }}>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold" style={{ margin: 0 }}>Projects</p>
                                            <p className="text-sm text-gray-300 font-semibold" style={{ margin: 0 }}>{repos.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold" style={{ margin: 0 }}>Stars</p>
                                            <p className="text-sm text-gray-300 font-semibold" style={{ margin: 0 }}>{totalStars}</p>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1" style={{ margin: 0, marginBottom: "0.25rem" }}>Top Skills</p>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                                                {(dev.primaryStack || []).slice(0, 4).map(lang => (
                                                    <span key={lang} className="text-[10px] bg-gray-800 text-gray-300 border border-gray-700" style={{ padding: "0.125rem 0.5rem", borderRadius: "0.25rem" }}>
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* Right Sidebar - Suggestions / News */}
            <aside className="hidden lg:block w-72 shrink-0">
                <div className="bg-[#18181A] rounded-xl border border-gray-800 p-4 sticky top-24">
                    <h3 className="font-bold text-white text-sm mb-4">Discover Network</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Scroll through the feed to find developers who align with your tech stack. 
                        Clicking <strong className="text-blue-400">Connect</strong> will send them a like, moving them to your Pending matches.
                    </p>
                    <div className="mt-6">
                        <ul className="space-y-3">
                            <li className="text-xs text-gray-300 flex justify-between">
                                <span>Total in queue</span>
                                <span className="font-bold">{deck.length}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </aside>
            
        </div>
    );
}

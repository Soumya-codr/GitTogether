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
            <aside className="hidden md:block w-64 shrink-0">
                <div className="bg-[#18181A] rounded-xl border border-gray-800 overflow-hidden shadow-lg sticky top-24">
                    <div className="h-16 bg-gradient-to-r from-gray-700 to-gray-600"></div>
                    <div className="px-4 pb-4 relative">
                        <img 
                            src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || "User"}`} 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full border-2 border-[#18181A] absolute -top-8 left-4 object-cover"
                        />
                        <div className="mt-10">
                            <h3 className="font-bold text-white text-lg leading-tight">{user?.name || user?.username || "Developer"}</h3>
                            <p className="text-xs text-gray-400 mt-1">Building the future</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <p className="text-xs text-gray-500 font-semibold mb-2">Intent Mode</p>
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full">
                                {intentConfig.emoji} {intentConfig.label}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Feed */}
            <main className="flex-1 flex flex-col gap-5 pb-20">
                {deck.map((dev) => {
                    const repos = dev.repositories || [];
                    const totalStars = repos.reduce((s, r) => s + r.stars, 0);
                    const isPending = pendingIds.has(dev.id);

                    return (
                        <div key={dev.id} className="bg-[#18181A] rounded-xl border border-gray-800 overflow-hidden shadow-lg transition-opacity duration-300" style={{ opacity: isPending ? 0.6 : 1 }}>
                            <div className="p-4 flex gap-4">
                                <img 
                                    src={dev.avatarUrl || `https://ui-avatars.com/api/?name=${dev.username}`} 
                                    alt={dev.username} 
                                    className="w-14 h-14 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h2 className="text-base font-bold text-white truncate">{dev.name || dev.username}</h2>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{dev.bio || "Software Engineer"}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{dev.location || "Earth"} · <span className="text-blue-400 font-semibold">{dev.compatibilityScore}% Match</span></p>
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
                                    <div className="mt-4 pt-3 border-t border-gray-800 flex gap-6">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Projects</p>
                                            <p className="text-sm text-gray-300 font-semibold">{repos.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Stars</p>
                                            <p className="text-sm text-gray-300 font-semibold">{totalStars}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Top Skills</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(dev.primaryStack || []).slice(0, 4).map(lang => (
                                                    <span key={lang} className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">
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

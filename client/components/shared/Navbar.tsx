"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Compass, Heart, MessageSquare, User, LogOut, GitBranch } from "lucide-react";

const LINKS = [
    { href: "/discover",  label: "Discover", icon: Compass },
    { href: "/matches",   label: "Matches",  icon: Heart },
    { href: "/profile",   label: "Profile",  icon: User },
];

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <nav className="gt-nav">
            {/* Logo */}
            <Link href="/discover" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                <div style={{
                    width: 30, height: 30,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-alt) 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 14px var(--accent-glow)",
                    flexShrink: 0,
                }}>
                    <GitBranch size={16} color="white" />
                </div>
                <span style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    background: "linear-gradient(90deg, var(--accent-light), var(--accent-alt))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.02em",
                }}>
                    GitTogether
                </span>
            </Link>

            {/* Nav links (desktop) */}
            <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                {LINKS.map((l) => {
                    const Icon = l.icon;
                    const active = pathname === l.href;
                    return (
                        <Link key={l.href} href={l.href} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            padding: "0.45rem 0.9rem",
                            borderRadius: "var(--radius-md)",
                            textDecoration: "none",
                            fontSize: "0.875rem",
                            fontWeight: active ? 700 : 500,
                            background: active ? "rgba(192, 38, 211, 0.10)" : "transparent",
                            color: active ? "var(--accent-light)" : "var(--text-secondary)",
                            border: active ? "1px solid var(--border-accent)" : "1px solid transparent",
                            transition: "all 0.18s ease",
                            boxShadow: active ? "0 0 14px var(--accent-glow)" : "none",
                        }}>
                            <Icon size={15} />
                            <span className="hidden sm:inline">{l.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Right: avatar + sign out */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {session?.user?.image && (
                    <Link href="/profile" title="View Profile">
                        <div style={{ position: "relative" }}>
                            <img
                                src={session.user.image}
                                alt=""
                                style={{
                                    width: 34, height: 34,
                                    borderRadius: "50%",
                                    border: "2px solid var(--border-accent)",
                                    cursor: "pointer",
                                    boxShadow: "0 0 10px var(--accent-glow)",
                                    display: "block",
                                }}
                            />
                            <span style={{
                                position: "absolute", bottom: 0, right: 0,
                                width: 9, height: 9,
                                background: "#22C55E",
                                borderRadius: "50%",
                                border: "1.5px solid var(--bg-base)",
                            }} />
                        </div>
                    </Link>
                )}
                <button
                    onClick={() => { localStorage.clear(); sessionStorage.clear(); signOut({ callbackUrl: "/" }); }}
                    title="Sign out"
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: "0.3rem",
                        borderRadius: "var(--radius-sm)",
                        transition: "color 0.18s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                    <LogOut size={16} />
                </button>
            </div>
        </nav>
    );
}

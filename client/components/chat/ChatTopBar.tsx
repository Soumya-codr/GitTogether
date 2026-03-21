"use client";
import { useRouter } from "next/navigation";

interface ChatTopBarProps {
    title?: string;
    matchId?: string;
}

export default function ChatTopBar({ title = "Chat" }: ChatTopBarProps) {
    const router = useRouter();
    return (
        <div style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 1.25rem",
            background: "var(--bg-nav)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--card-border)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>
            <button
                onClick={() => router.push("/matches")}
                style={{ 
                    background: "none", 
                    border: "none", 
                    color: "var(--text-secondary)", 
                    fontSize: "0.875rem", 
                    fontWeight: 600,
                    cursor: "pointer", 
                    padding: "0.2rem 0.5rem",
                    borderRadius: "0.4rem",
                    transition: "all 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-pink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
                ← Back
            </button>
            <p style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1rem", letterSpacing: "-0.01em" }}>{title}</p>
        </div>
    );
}

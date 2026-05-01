"use client";
import { Settings2 } from "lucide-react";
import type { IntentConfig } from "@/lib/intentConfig";

interface IntentBannerProps {
    config: IntentConfig;
    onChangeIntent: () => void;
}

export default function IntentBanner({ config, onChangeIntent }: IntentBannerProps) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.4rem 0.9rem 0.4rem 0.6rem",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
        }}>
            <span style={{
                width: 28, height: 28,
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-elevated)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem",
            }}>
                {config.emoji || "🔗"}
            </span>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                {config.label || "Casual Dev Connect"}
            </span>
            <button
                onClick={onChangeIntent}
                style={{
                    background: "none", border: "none",
                    color: "var(--text-muted)", cursor: "pointer",
                    display: "flex", alignItems: "center",
                    padding: "0.15rem",
                    borderRadius: "var(--radius-sm)",
                    transition: "color 0.15s",
                    marginLeft: "0.25rem",
                }}
                title="Change mode"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-light)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
                <Settings2 size={14} />
            </button>
        </div>
    );
}

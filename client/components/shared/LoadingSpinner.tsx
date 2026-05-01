"use client";

export default function LoadingSpinner() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
            background: "var(--bg-base)",
        }}>
            {/* Skeleton card */}
            <div style={{ width: "100%", maxWidth: 400, padding: "0 1rem" }}>
                {/* Skeleton avatar + name */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div className="skeleton" style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div className="skeleton" style={{ height: 14, width: "60%", borderRadius: "var(--radius-full)" }} />
                        <div className="skeleton" style={{ height: 12, width: "40%", borderRadius: "var(--radius-full)" }} />
                    </div>
                </div>
                {/* Skeleton card */}
                <div className="skeleton" style={{ height: 300, borderRadius: "var(--radius-2xl)" }} />
                {/* Skeleton tags */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    {[80, 64, 72].map((w, i) => (
                        <div key={i} className="skeleton" style={{ height: 28, width: w, borderRadius: "var(--radius-full)" }} />
                    ))}
                </div>
            </div>

            {/* Brand */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                fontWeight: 600,
            }}>
                <div style={{
                    width: 6, height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 8px var(--accent-glow)",
                    animation: "skeleton-pulse 1.2s ease-in-out infinite",
                }} />
                Loading...
            </div>
        </div>
    );
}

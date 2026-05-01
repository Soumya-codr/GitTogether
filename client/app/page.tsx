"use client";
import BrandHeader from "@/components/landing/BrandHeader";
import AuthCard from "@/components/landing/AuthCard";

export default function LandingPage() {
    return (
        <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
            {/* Background orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            {/* Layout: side-by-side on desktop, stacked on mobile */}
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
                padding: "2rem 1.5rem",
                gap: "4rem",
                flexWrap: "wrap",
            }}>
                {/* Left: Branding */}
                <div style={{ flex: "1 1 400px", maxWidth: 560 }}>
                    <BrandHeader />
                </div>

                {/* Right: Auth card */}
                <div style={{ flex: "0 1 400px", width: "100%", maxWidth: 400 }}>
                    <AuthCard />
                </div>
            </div>
        </main>
    );
}

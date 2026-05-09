"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { GitBranch, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function AuthCard() {
    const [showEmail, setShowEmail] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="gt-card-glass"
            style={{
                padding: "2rem",
                width: "100%",
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <h2 style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    marginBottom: "0.35rem",
                }}>
                    Initialize Connection
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Authentication required to proceed.
                </p>
            </div>

            {/* Primary: GitHub CTA */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn("github", { callbackUrl: "/intent" })}
                style={{
                    width: "100%",
                    padding: "0.9rem 1.25rem",
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-alt) 100%)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.65rem",
                    boxShadow: "0 4px 24px var(--accent-glow), 0 1px 3px rgba(0,0,0,0.4)",
                    transition: "all 0.22s ease",
                }}
            >
                <GitBranch size={20} />
                Continue with GitHub
                <ArrowRight size={16} style={{ marginLeft: "auto" }} />
            </motion.button>



            {/* Terms */}
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
                By connecting, you agree to our{" "}
                <span style={{ color: "var(--accent-light)", cursor: "pointer", fontWeight: 600 }}>Terms of Service</span>
                {" "}and{" "}
                <span style={{ color: "var(--accent-light)", cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>
            </p>
        </motion.div>
    );
}

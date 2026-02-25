"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Sets up axios Authorization header from sessionStorage on every page load
function setupAxiosAuth() {
    const token = sessionStorage.getItem("gt_token");
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
}

// After NextAuth login, get Express JWT and store in sessionStorage
function CookieSyncer() {
    const { data: session, status } = useSession();
    const synced = useRef(false);

    useEffect(() => {
        // Restore token from sessionStorage on mount
        setupAxiosAuth();
    }, []);

    useEffect(() => {
        if (status === "authenticated" && !synced.current && (session as any)?.accessToken) {
            synced.current = true;
            axios.post(`${API}/api/auth/cookie`,
                { accessToken: (session as any).accessToken },
                { withCredentials: true }
            ).then((res) => {
                if (res.data?.token) {
                    sessionStorage.setItem("gt_token", res.data.token);
                    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
                }
            }).catch(() => { synced.current = false; });
        }
        // Clear token on logout
        if (status === "unauthenticated") {
            sessionStorage.removeItem("gt_token");
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [status, session]);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CookieSyncer />
            {children}
        </SessionProvider>
    );
}

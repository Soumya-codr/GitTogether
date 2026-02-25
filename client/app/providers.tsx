"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// After NextAuth login, exchange GitHub token for Express JWT cookie
function CookieSyncer() {
    const { data: session, status } = useSession();
    const synced = useRef(false);

    useEffect(() => {
        if (status === "authenticated" && !synced.current && (session as any)?.accessToken) {
            synced.current = true;
            axios.post(`${API}/api/auth/cookie`,
                { accessToken: (session as any).accessToken },
                { withCredentials: true }
            ).catch(() => { synced.current = false; }); // retry if failed
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

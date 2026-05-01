import NextAuth, { NextAuthOptions } from "next-auth";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        {
            id: "github",
            name: "GitHub",
            type: "oauth",
            authorization: {
                url: "https://github.com/login/oauth/authorize",
                params: { scope: "read:user user:email" },
            },
            token: "https://github.com/login/oauth/access_token",
            userinfo: "https://api.github.com/user",
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            checks: ["state"],
            profile(profile) {
                return {
                    id: String(profile.id),
                    name: profile.name ?? profile.login,
                    email: profile.email ?? null,
                    image: profile.avatar_url,
                    login: profile.login,
                    githubId: String(profile.id),
                    bio: profile.bio ?? null,
                    location: profile.location ?? null,
                };
            },
        },
    ],
    pages: { signIn: "/", error: "/" },
    session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider !== "github") return false;
            const p = profile as any;
            try {
                await prisma.user.upsert({
                    where: { githubId: p.githubId ?? String(p.id) },
                    update: {
                        username: p.login,
                        name: p.name,
                        avatarUrl: p.image ?? p.avatar_url,
                        bio: p.bio,
                        location: p.location,
                        updatedAt: new Date(),
                    },
                    create: {
                        githubId: p.githubId ?? String(p.id),
                        username: p.login,
                        name: p.name,
                        avatarUrl: p.image ?? p.avatar_url,
                        bio: p.bio,
                        location: p.location,
                        primaryStack: [],
                    },
                });

                // Trigger backend to sync repositories and compute primary stack
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
                fetch(`${apiUrl}/api/auth/sync`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        accessToken: account?.access_token,
                        githubId: p.githubId ?? String(p.id),
                        username: p.login,
                        name: p.name,
                        avatarUrl: p.image ?? p.avatar_url,
                        bio: p.bio,
                        location: p.location,
                    })
                }).catch(err => console.error("Failed to trigger repo sync:", err));

            } catch (err) {
                console.error("DB sync failed (non-fatal):", err);
            }
            return true;
        },
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                token.githubId = String((profile as any)?.id);
                token.username = (profile as any)?.login;
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            (session as any).user.githubId = token.githubId;
            (session as any).user.username = token.username;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

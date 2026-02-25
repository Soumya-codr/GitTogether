import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import prisma from "@/lib/prisma";

async function fetchReposAndStack(username: string, token: string) {
    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const repos = await res.json();
        if (!Array.isArray(repos)) return { repoData: [], primaryStack: [] };

        const langCount: Record<string, number> = {};
        const repoData = repos.map((r: any) => {
            if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
            return { repoName: r.name, language: r.language || null, stars: r.stargazers_count || 0, forks: r.forks_count || 0, topics: r.topics || [] };
        });
        const primaryStack = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l);
        return { repoData, primaryStack };
    } catch { return { repoData: [], primaryStack: [] }; }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    pages: { signIn: "/", error: "/" },
    session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider !== "github") return false;
            try {
                const { repoData, primaryStack } = await fetchReposAndStack(
                    (profile as any).login,
                    account.access_token!
                );
                const user = await prisma.user.upsert({
                    where: { githubId: String((profile as any).id) },
                    update: {
                        username: (profile as any).login,
                        name: (profile as any).name,
                        avatarUrl: (profile as any).avatar_url,
                        bio: (profile as any).bio,
                        location: (profile as any).location,
                        primaryStack,
                        updatedAt: new Date(),
                    },
                    create: {
                        githubId: String((profile as any).id),
                        username: (profile as any).login,
                        name: (profile as any).name,
                        avatarUrl: (profile as any).avatar_url,
                        bio: (profile as any).bio,
                        location: (profile as any).location,
                        primaryStack,
                    },
                });
                await prisma.repository.deleteMany({ where: { userId: user.id } });
                if (repoData.length > 0) {
                    await prisma.repository.createMany({ data: repoData.map((r) => ({ ...r, userId: user.id })) });
                }
            } catch (err) {
                console.error("DB sync failed:", err);
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

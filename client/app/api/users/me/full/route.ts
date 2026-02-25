import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const username = (session as any).user?.username;
    const accessToken = (session as any).accessToken;
    if (!username) return NextResponse.json({ error: "No username" }, { status: 400 });

    const user = await prisma.user.findUnique({
        where: { username },
        include: { repositories: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch GitHub stats + sync repos
    let githubStats = {};
    try {
        const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

        const [ghUser, ghRepos] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { headers }),
            fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`, { headers }),
        ]);

        const g = await ghUser.json();
        const repos = await ghRepos.json();

        githubStats = {
            followers: g.followers ?? 0,
            following: g.following ?? 0,
            publicRepos: g.public_repos ?? 0,
            publicGists: g.public_gists ?? 0,
            company: g.company,
            blog: g.blog,
            twitterUsername: g.twitter_username,
            createdAt: g.created_at,
            githubUrl: g.html_url,
        };

        // Sync repos in background
        if (Array.isArray(repos) && repos.length > 0) {
            const langCount: Record<string, number> = {};
            const repoData = repos.filter((r: any) => !r.fork).map((r: any) => {
                if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
                return { repoName: r.name, language: r.language || null, stars: r.stargazers_count || 0, forks: r.forks_count || 0, topics: r.topics || [], userId: user.id };
            });
            const primaryStack = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l);

            await prisma.repository.deleteMany({ where: { userId: user.id } });
            if (repoData.length > 0) await prisma.repository.createMany({ data: repoData });
            await prisma.user.update({ where: { id: user.id }, data: { primaryStack } });
        }
    } catch (err) {
        console.error("GitHub stats fetch failed:", err);
    }

    // Re-fetch updated user with fresh repos
    const updatedUser = await prisma.user.findUnique({
        where: { username },
        include: { repositories: true },
    });

    return NextResponse.json({ ...updatedUser, githubStats });
}

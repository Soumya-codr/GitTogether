const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { fetchReposAndStack } = require("../services/githubService");
const { signToken } = require("../lib/jwt");

// POST /api/auth/sync — called by NextAuth server-side after GitHub login
router.post("/sync", async (req, res) => {
    const { accessToken, githubId, username, name, avatarUrl, bio, location } = req.body;
    if (!githubId || !username) return res.status(400).json({ error: "Missing required fields" });

    try {
        const { repoData, primaryStack } = await fetchReposAndStack(username, accessToken);

        const user = await prisma.user.upsert({
            where: { githubId: String(githubId) },
            update: { username, name, avatarUrl, bio, location, primaryStack, updatedAt: new Date() },
            create: { githubId: String(githubId), username, name, avatarUrl, bio, location, primaryStack },
        });

        // Sync repositories
        await prisma.repository.deleteMany({ where: { userId: user.id } });
        await prisma.repository.createMany({
            data: repoData.map((r) => ({ ...r, userId: user.id })),
        });

        res.json({ ok: true, userId: user.id });
    } catch (err) {
        console.error("Sync error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/cookie — called from browser after NextAuth login
// Exchanges GitHub access_token for an Express JWT cookie
router.post("/cookie", async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "Missing accessToken" });

    try {
        // Verify token with GitHub API
        const ghRes = await fetch("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!ghRes.ok) return res.status(401).json({ error: "Invalid GitHub token" });
        const ghUser = await ghRes.json();

        // Find user in DB
        const user = await prisma.user.findUnique({
            where: { githubId: String(ghUser.id) },
        });
        if (!user) return res.status(404).json({ error: "User not synced yet" });

        // Sign Express JWT and set cookie
        const token = signToken(user.id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 8 * 60 * 60 * 1000, // 8 hours
        });

        res.json({ ok: true, userId: user.id });
    } catch (err) {
        console.error("Cookie exchange error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;


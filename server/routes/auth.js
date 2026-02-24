const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { fetchReposAndStack } = require("../services/githubService");

// POST /api/auth/sync — called by NextAuth after GitHub login
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

module.exports = router;

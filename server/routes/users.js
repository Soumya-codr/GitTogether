const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");
const axios = require("axios");

// GET /api/users/me — basic profile
router.get("/me", requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { repositories: { take: 10 } },
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/me/full — full profile with all repos + live GitHub stats
router.get("/me/full", requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { repositories: { orderBy: { stars: "desc" } } },
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Fetch live GitHub stats
        let githubStats = {};
        try {
            const ghRes = await axios.get(`https://api.github.com/users/${user.username}`, {
                headers: { Accept: "application/vnd.github.v3+json" },
            });
            const g = ghRes.data;
            githubStats = {
                followers: g.followers,
                following: g.following,
                publicRepos: g.public_repos,
                publicGists: g.public_gists,
                company: g.company,
                blog: g.blog,
                twitterUsername: g.twitter_username,
                createdAt: g.created_at,
                githubUrl: g.html_url,
            };
        } catch { /* non-fatal if rate limited */ }

        res.json({ ...user, githubStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// PATCH /api/users/me — update intent mode or privacy settings
router.patch("/me", requireAuth, async (req, res) => {
    const { intentMode, hideLocation, hideDating, bio } = req.body;
    try {
        const updated = await prisma.user.update({
            where: { id: req.userId },
            data: {
                ...(intentMode && { intentMode }),
                ...(hideLocation !== undefined && { hideLocation }),
                ...(hideDating !== undefined && { hideDating }),
                ...(bio !== undefined && { bio }),
            },
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

// GET /api/repos — fetch discoverable repositories
router.get("/", requireAuth, async (req, res) => {
    try {
        // Optimized single-query fetch using 'none' relation filter (Faster than notIn)
        const repos = await prisma.repository.findMany({
            where: { 
                userId: { not: req.userId },
                swipes: {
                    none: { userId: req.userId }
                }
            },
            include: { 
                user: { select: { id: true, username: true, avatarUrl: true } }
            },
            orderBy: { stars: "desc" },
            take: 20
        });

        res.json(repos);
    } catch (err) {
        console.error("❌ Error fetching discoverable repos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/repos/joined — fetch repos the user has swiped right on or owns
router.get("/joined", requireAuth, async (req, res) => {
    try {
        // Repos I swiped right on
        // 1. Get IDs of repos I swiped right on
        const myLikes = await prisma.repoSwipe.findMany({
            where: { userId: req.userId, swipeType: "like" },
            select: { repoId: true }
        });
        const likedRepoIds = myLikes.map(s => s.repoId);

        // 2. Get IDs of my repos that OTHERS swiped right on
        const othersLikes = await prisma.repoSwipe.findMany({
            where: { 
                swipeType: "like",
                repo: { userId: req.userId }
            },
            select: { repoId: true }
        });
        const matchedRepoIds = othersLikes.map(s => s.repoId);

        // 3. Combine and fetch full repo objects with user data
        const allRelevantIds = [...new Set([...likedRepoIds, ...matchedRepoIds])];
        
        const projects = await prisma.repository.findMany({
            where: { id: { in: allRelevantIds } },
            include: { 
                user: { select: { id: true, username: true, avatarUrl: true } } 
            },
            orderBy: { stars: "desc" }
        });

        // 4. Sanitize and Serialize (Ensures no "Unknown" or undefined links reach the client)
        const sanitized = projects.map(p => {
            const owner = p.user?.username || "Unknown";
            let url = p.url;
            if (!url || url.includes("/Unknown/")) {
                url = `https://github.com/${owner}/${p.name}`;
            }
            return {
                ...p,
                url: url || `https://github.com/search?q=${p.name}` // Hard fallback
            };
        });

        res.json(sanitized);
    } catch (err) {
        console.error("❌ Error fetching joined repos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/repos/:id/swipe — record user swipe on a repo
router.post("/:id/swipe", requireAuth, async (req, res) => {
    try {
        const repoId = req.params.id;
        const { swipeType } = req.body; // 'like' or 'pass'

        await prisma.repoSwipe.upsert({
            where: {
                userId_repoId: { userId: req.userId, repoId },
            },
            update: { swipeType },
            create: { userId: req.userId, repoId, swipeType },
        });

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error swiping on repo:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/repos/:id/swipe — remove swipe so repo reappears in discover feed
// ⚠️ Only deletes the RepoSwipe record — does NOT touch the Repository or any other data
router.delete("/:id/swipe", requireAuth, async (req, res) => {
    try {
        const repoId = req.params.id;
        await prisma.repoSwipe.deleteMany({
            where: { userId: req.userId, repoId },
        });
        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error deleting repo swipe:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/repos/:id/messages — get community chat history for a repo
router.get("/:id/messages", requireAuth, async (req, res) => {
    try {
        const repoId = req.params.id;

        // Verify the user is either the owner or has liked the repo
        const repo = await prisma.repository.findUnique({ where: { id: repoId } });
        if (!repo) return res.status(404).json({ error: "Repository not found" });

        const hasLiked = await prisma.repoSwipe.findFirst({
            where: { userId: req.userId, repoId: repoId, swipeType: "like" }
        });

        if (repo.userId !== req.userId && !hasLiked) {
            return res.status(403).json({ error: "Not authorized to view this repo chat" });
        }

        const messages = await prisma.repoMessage.findMany({
            where: { repoId },
            include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
            orderBy: { createdAt: "asc" },
        });
        
        res.json(messages);
    } catch (err) {
        console.error("❌ Error fetching repo messages:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/repos/:id/messages — send a message to repo chat
router.post("/:id/messages", requireAuth, async (req, res) => {
    try {
        const repoId = req.params.id;
        const { messageText } = req.body;

        if (!messageText?.trim()) return res.status(400).json({ error: "Message cannot be empty" });

        // Verify the user is either the owner or has liked the repo
        const repo = await prisma.repository.findUnique({ where: { id: repoId } });
        if (!repo) return res.status(404).json({ error: "Repository not found" });

        const hasLiked = await prisma.repoSwipe.findFirst({
            where: { userId: req.userId, repoId: repoId, swipeType: "like" }
        });

        if (repo.userId !== req.userId && !hasLiked) {
            return res.status(403).json({ error: "Not authorized to chat in this repo" });
        }

        const message = await prisma.repoMessage.create({
            data: { repoId, senderId: req.userId, messageText: messageText.trim() },
            include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
        });

        // Emit to socket room for repo group chat
        const io = req.app.get("io");
        const roomId = `repo-${repoId}`;
        console.log(`📡 Emitting 'new-message' to repo room ${roomId}: "${message.messageText.substring(0, 20)}..."`);
        io.to(roomId).emit("new-message", message);

        res.json(message);
    } catch (err) {
        console.error("❌ Error sending repo message:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

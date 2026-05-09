const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

// GET /api/repos — fetch discoverable repositories
router.get("/", requireAuth, async (req, res) => {
    try {
        // Find IDs of repos this user has already swiped on
        const swipedRepos = await prisma.repoSwipe.findMany({
            where: { userId: req.userId },
            select: { repoId: true }
        });
        const swipedIds = swipedRepos.map(s => s.repoId);

        // Fetch repos not belonging to the user and not already swiped
        const repos = await prisma.repository.findMany({
            where: { 
                userId: { not: req.userId },
                id: { notIn: swipedIds }
            },
            include: { 
                user: { select: { id: true, username: true, avatarUrl: true } }
            },
            orderBy: { stars: "desc" },
            take: 20 // Send a batch
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
        const swiped = await prisma.repoSwipe.findMany({
            where: { userId: req.userId, swipeType: "like" },
            include: { repo: true }
        });
        const swipedRepos = swiped.map(s => s.repo);

        // My own repos that others have swiped right on
        const myLikedRepos = await prisma.repoSwipe.findMany({
            where: { 
                swipeType: "like",
                repo: { userId: req.userId }
            },
            include: { repo: true }
        });
        
        // Deduplicate using a Map
        const repoMap = new Map();
        swipedRepos.forEach(r => repoMap.set(r.id, r));
        myLikedRepos.forEach(r => repoMap.set(r.repo.id, r.repo));

        res.json(Array.from(repoMap.values()));
    } catch (err) {
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

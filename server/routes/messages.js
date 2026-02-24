const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

// GET /api/messages/:matchId
router.get("/:matchId", requireAuth, async (req, res) => {
    const { matchId } = req.params;
    try {
        // Verify the user is part of this match
        const match = await prisma.match.findFirst({
            where: {
                id: matchId,
                OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
            },
        });
        if (!match) return res.status(403).json({ error: "Not authorized" });

        const messages = await prisma.message.findMany({
            where: { matchId },
            include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
            orderBy: { createdAt: "asc" },
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/messages/:matchId
router.post("/:matchId", requireAuth, async (req, res) => {
    const { matchId } = req.params;
    const { messageText } = req.body;
    if (!messageText?.trim()) return res.status(400).json({ error: "Message cannot be empty" });

    try {
        const match = await prisma.match.findFirst({
            where: {
                id: matchId,
                OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
            },
        });
        if (!match) return res.status(403).json({ error: "Not authorized" });

        const message = await prisma.message.create({
            data: { matchId, senderId: req.userId, messageText: messageText.trim() },
            include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
        });
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

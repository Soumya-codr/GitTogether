const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

// GET /api/matches
router.get("/", requireAuth, async (req, res) => {
    try {
        const matches = await prisma.match.findMany({
            where: {
                OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
            },
            include: {
                user1: { select: { id: true, username: true, name: true, avatarUrl: true, primaryStack: true, intentMode: true } },
                user2: { select: { id: true, username: true, name: true, avatarUrl: true, primaryStack: true, intentMode: true } },
                messages: { orderBy: { createdAt: "desc" }, take: 1 },
            },
            orderBy: { createdAt: "desc" },
        });

        // Return the "other" user for each match
        const formatted = matches.map((m) => ({
            matchId: m.id,
            compatibilityScore: m.compatibilityScore,
            createdAt: m.createdAt,
            lastMessage: m.messages[0] || null,
            partner: m.user1Id === req.userId ? m.user2 : m.user1,
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

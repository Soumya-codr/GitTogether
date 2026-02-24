const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");
const { calculateCompatibility } = require("../services/matchingService");

// GET /api/discover — returns a scored, filtered swipe deck
router.get("/", requireAuth, async (req, res) => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { repositories: true },
        });

        // Get all users this user has already swiped
        const swiped = await prisma.swipe.findMany({
            where: { swiperId: req.userId },
            select: { targetId: true },
        });
        const swipedIds = swiped.map((s) => s.targetId);
        swipedIds.push(req.userId); // exclude self

        // Fetch candidate pool
        const candidates = await prisma.user.findMany({
            where: {
                id: { notIn: swipedIds },
                hideDating: currentUser.intentMode === "dating" ? false : undefined,
            },
            include: { repositories: true },
            take: 50,
        });

        // Score and sort
        const scored = candidates
            .map((c) => ({
                ...c,
                compatibilityScore: calculateCompatibility(currentUser, c),
                // respect privacy: strip location if user has it hidden
                location: c.hideLocation ? null : c.location,
            }))
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
            .slice(0, 20);

        res.json(scored);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

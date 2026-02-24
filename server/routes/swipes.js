const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");
const { calculateCompatibility } = require("../services/matchingService");

// POST /api/swipes
router.post("/", requireAuth, async (req, res) => {
    const { targetId, swipeType } = req.body;
    if (!targetId || !swipeType) return res.status(400).json({ error: "Missing fields" });

    try {
        // Upsert the swipe
        await prisma.swipe.upsert({
            where: { swiperId_targetId: { swiperId: req.userId, targetId } },
            update: { swipeType },
            create: { swiperId: req.userId, targetId, swipeType },
        });

        let match = null;

        // Check if target has already liked us back
        if (swipeType === "like" || swipeType === "superlike") {
            const reverseSwipe = await prisma.swipe.findFirst({
                where: {
                    swiperId: targetId,
                    targetId: req.userId,
                    swipeType: { in: ["like", "superlike"] },
                },
            });

            if (reverseSwipe) {
                // Calculate compatibility
                const [userA, userB] = await Promise.all([
                    prisma.user.findUnique({ where: { id: req.userId }, include: { repositories: true } }),
                    prisma.user.findUnique({ where: { id: targetId }, include: { repositories: true } }),
                ]);
                const score = calculateCompatibility(userA, userB);

                // Create match (ordered IDs to prevent duplicates)
                const [u1, u2] = [req.userId, targetId].sort();
                match = await prisma.match.upsert({
                    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
                    update: { compatibilityScore: score },
                    create: { user1Id: u1, user2Id: u2, compatibilityScore: score },
                });
            }
        }

        res.json({ success: true, matched: !!match, match });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

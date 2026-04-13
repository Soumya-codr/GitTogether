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

        console.log("DEBUG: Swipe result:", { matched: !!match, matchId: match?.id });
        res.json({ success: true, matched: !!match, match });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/swipes/pending — users I liked but haven't matched with yet
router.get("/pending", requireAuth, async (req, res) => {
    try {
        // All users I've liked/superliked
        const myLikes = await prisma.swipe.findMany({
            where: {
                swiperId: req.userId,
                swipeType: { in: ["like", "superlike"] },
            },
            include: {
                target: {
                    select: {
                        id: true, username: true, name: true,
                        avatarUrl: true, primaryStack: true, bio: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get all my matched user IDs to exclude them
        const myMatches = await prisma.match.findMany({
            where: { OR: [{ user1Id: req.userId }, { user2Id: req.userId }] },
            select: { user1Id: true, user2Id: true },
        });
        const matchedIds = new Set(
            myMatches.map((m) => m.user1Id === req.userId ? m.user2Id : m.user1Id)
        );

        // Pending = liked but NOT yet matched
        const pending = myLikes
            .filter((s) => !matchedIds.has(s.targetId))
            .map((s) => ({
                targetId: s.targetId,
                swipeType: s.swipeType,
                likedAt: s.createdAt,
                user: s.target,
            }));

        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/swipes/pending?targetId=xxx — undo a like, returns them to discover queue
router.delete("/pending", requireAuth, async (req, res) => {
    const { targetId } = req.query;
    if (!targetId) return res.status(400).json({ error: "targetId required" });
    try {
        await prisma.swipe.deleteMany({
            where: { swiperId: req.userId, targetId },
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

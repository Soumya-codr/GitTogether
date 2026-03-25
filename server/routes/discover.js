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

        // Get only users this user has liked/superliked (exclude from pool)
        const activeSwipes = await prisma.swipe.findMany({
            where: { 
                swiperId: req.userId,
                swipeType: { in: ["like", "superlike"] }
            },
            select: { targetId: true },
        });
        const likedIds = activeSwipes.map((s) => s.targetId);

        // Exclude matches
        const matches = await prisma.match.findMany({
            where: { OR: [{ user1Id: req.userId }, { user2Id: req.userId }] },
            select: { user1Id: true, user2Id: true }
        });
        const matchedIds = matches.map(m => m.user1Id === req.userId ? m.user2Id : m.user1Id);

        const excludedIds = Array.from(new Set([req.userId, ...likedIds, ...matchedIds]));
        
        const totalOtherUsers = await prisma.user.count({ where: { id: { notIn: [req.userId] } } });
        console.log(`📊 Discovery Report for ${currentUser.username}:`);
        console.log(`- Total Users in DB (ex-self): ${totalOtherUsers}`);
        console.log(`- Excluded (Likes/Matches): ${excludedIds.length - 1}`);

        // Fetch candidate pool
        let whereClause = { id: { notIn: excludedIds } };
        if (currentUser.intentMode === "dating") {
            whereClause.hideDating = false;
        }

        let candidates = await prisma.user.findMany({
            where: whereClause,
            include: { repositories: true },
            take: 100,
        });

        // RE-DISCOVERY FALLBACK: If pool is empty, but we have users we previously PASSed
        if (candidates.length === 0 && totalOtherUsers > (excludedIds.length - 1)) {
            console.log("♻️ Pool empty. Recycling 'Passed' users and relaxing filters...");
            candidates = await prisma.user.findMany({
                where: { id: { notIn: excludedIds } }, // Strictly only exclude Likes/Matches/Self
                include: { repositories: true },
                take: 100,
            });
        }

        console.log(`✅ Final Results: ${candidates.length} cards to show.`);

        // Score, sort and add randomness
        const scored = candidates
            .map((c) => ({
                ...c,
                compatibilityScore: calculateCompatibility(currentUser, c),
                location: c.hideLocation ? null : c.location,
                randomSort: Math.random(),
            }))
            .sort((a, b) => {
                if (b.compatibilityScore !== a.compatibilityScore) {
                    return b.compatibilityScore - a.compatibilityScore;
                }
                return b.randomSort - a.randomSort;
            })
            .slice(0, 20);

        res.json(scored);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

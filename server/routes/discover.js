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
        const excluded = await prisma.swipe.findMany({
            where: { 
                swiperId: req.userId,
                swipeType: { in: ["like", "superlike"] }
            },
            select: { targetId: true },
        });
        const excludedIds = excluded.map((s) => s.targetId);
        excludedIds.push(req.userId); // exclude self

        // MATCHES: Also exclude people we are already matched with
        const matches = await prisma.match.findMany({
            where: {
                OR: [{ user1Id: req.userId }, { user2Id: req.userId }]
            },
            select: { user1Id: true, user2Id: true }
        });
        matches.forEach(m => {
            excludedIds.push(m.user1Id === req.userId ? m.user2Id : m.user1Id);
        });

        const totalUsersPool = await prisma.user.count({ where: { id: { notIn: [req.userId] } } });
        console.log(`📊 DB Snapshot: Total other users: ${totalUsersPool}. Already excluded (Liked/Matched): ${excludedIds.length - 1}`);

        // Fetch candidate pool
        let whereClause = {
            id: { notIn: Array.from(new Set(excludedIds)) },
        };

        // Only apply dating filter if in dating mode
        if (currentUser.intentMode === "dating") {
            whereClause.hideDating = false;
        }

        let candidates = await prisma.user.findMany({
            where: whereClause,
            include: { repositories: true },
            take: 100,
        });

        // FALLBACK: If pool is empty, maybe privacy filters are too strict? 
        // Try without hideDating for a moment if that was the bottleneck (only if not strictly dating)
        if (candidates.length === 0 && totalUsersPool > (excludedIds.length - 1)) {
            console.log("⚠️ Pool empty but users exist. Retrying with permissive filters...");
            candidates = await prisma.user.findMany({
                where: { id: { notIn: Array.from(new Set(excludedIds)) } },
                include: { repositories: true },
                take: 100,
            });
        }

        console.log(`✅ Final Candidate Pool: ${candidates.length} users found.`);

        // Score, sort and add a bit of randomness to equal scores
        const scored = candidates
            .map((c) => ({
                ...c,
                compatibilityScore: calculateCompatibility(currentUser, c),
                location: c.hideLocation ? null : c.location,
                randomSort: Math.random(), // Add randomness for fresh feel
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

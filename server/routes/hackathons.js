const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

// GET /api/hackathons — fetch upcoming hackathons (filtering out already swiped ones)
router.get("/", requireAuth, async (req, res) => {
    try {
        // Find IDs of hackathons this user has already swiped on
        const swipedHackathons = await prisma.hackathonSwipe.findMany({
            where: { userId: req.userId },
            select: { hackathonId: true }
        });
        const swipedIds = swipedHackathons.map(s => s.hackathonId);

        const hackathons = await prisma.hackathon.findMany({
            where: { 
                endDate: { gte: new Date() },
                id: { notIn: swipedIds } // EXCLUDE ALREADY SWIPED
            },
            include: { 
                _count: { select: { interests: true } } 
            },
            orderBy: { featured: "desc" }
        });

        // Map to include a simple interestedCount
        const formatted = hackathons.map(h => ({
            ...h,
            interestedCount: h._count.interests
        }));

        res.json(formatted);
    } catch (err) {
        console.error("❌ Error fetching hackathons:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hackathons/joined — hackathons the user has joined
router.get("/joined", requireAuth, async (req, res) => {
    try {
        const interests = await prisma.hackathonInterest.findMany({
            where: { userId: req.userId },
            include: { hackathon: true }
        });
        const hackathons = interests.map(i => i.hackathon);
        res.json(hackathons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/hackathons/:id/join — record user interest & swipe
router.post("/:id/join", requireAuth, async (req, res) => {
    try {
        const hackathonId = req.params.id;

        // 1. Record Interest
        await prisma.hackathonInterest.upsert({
            where: {
                userId_hackathonId: { userId: req.userId, hackathonId },
            },
            update: {},
            create: { userId: req.userId, hackathonId },
        });

        // 2. Record Swipe (Like)
        await prisma.hackathonSwipe.upsert({
            where: {
                userId_hackathonId: { userId: req.userId, hackathonId },
            },
            update: { swipeType: "like" },
            create: { userId: req.userId, hackathonId, swipeType: "like" },
        });

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error joining hackathon:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/hackathons/:id/pass — record user pass swipe
router.post("/:id/pass", requireAuth, async (req, res) => {
    try {
        const hackathonId = req.params.id;

        await prisma.hackathonSwipe.upsert({
            where: {
                userId_hackathonId: { userId: req.userId, hackathonId },
            },
            update: { swipeType: "pass" },
            create: { userId: req.userId, hackathonId, swipeType: "pass" },
        });

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error passing hackathon:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hackathons/:id/partners — find other users interested in same hackathon
router.get("/:id/partners", requireAuth, async (req, res) => {
    try {
        const hackathonId = req.params.id;
        
        // Find users who have interest in THIS hackathon, excluding the current user
        const interests = await prisma.hackathonInterest.findMany({
            where: { 
                hackathonId: hackathonId,
                userId: { not: req.userId }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        bio: true,
                        primaryStack: true,
                        secondaryStack: true,
                        experienceLevel: true,
                        githubId: true
                    }
                }
            }
        });

        const partners = interests.map(i => i.user);
        res.json({ partners });
    } catch (err) {
        console.error("❌ Error fetching partners:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/hackathons/:id/leave — leave a hackathon
router.delete("/:id/leave", requireAuth, async (req, res) => {
    try {
        const hackathonId = req.params.id;

        await prisma.hackathonInterest.deleteMany({
            where: {
                userId: req.userId, 
                hackathonId: hackathonId
            }
        });

        // Also delete the swipe so it returns to the discovery deck
        await prisma.hackathonSwipe.deleteMany({
            where: {
                userId: req.userId, 
                hackathonId: hackathonId
            }
        });

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error leaving hackathon:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

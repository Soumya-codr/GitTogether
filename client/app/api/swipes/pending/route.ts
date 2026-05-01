import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

async function getCurrentUser(session: any) {
    if (!session?.user?.username) return null;
    return prisma.user.findUnique({ where: { username: session.user.username } });
}

// GET /api/swipes/pending — users I liked but haven't matched back yet
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // All users I've liked/superliked
    const myLikes = await prisma.swipe.findMany({
        where: {
            swiperId: currentUser.id,
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

    // Get all my matched user IDs so we can exclude them
    const myMatches = await prisma.match.findMany({
        where: { OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }] },
        select: { user1Id: true, user2Id: true },
    });
    const matchedIds = new Set(
        myMatches.map((m) => m.user1Id === currentUser.id ? m.user2Id : m.user1Id)
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

    return NextResponse.json(pending);
}

// DELETE /api/swipes/pending?targetId=xxx — undo a like, sends them back to discover queue
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");
    if (!targetId) return NextResponse.json({ error: "targetId required" }, { status: 400 });

    await prisma.swipe.deleteMany({
        where: { swiperId: currentUser.id, targetId },
    });

    return NextResponse.json({ success: true });
}

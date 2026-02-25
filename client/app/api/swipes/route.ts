import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { calculateCompatibility } from "@/lib/matchingService";

async function getCurrentUser(session: any) {
    if (!session?.user?.username) return null;
    return prisma.user.findUnique({
        where: { username: session.user.username },
        include: { repositories: true },
    });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { targetId, swipeType } = await req.json();
    if (!targetId || !swipeType) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    try {
        await prisma.swipe.create({
            data: { swiperId: currentUser.id, targetId, swipeType },
        });
    } catch {
        // Duplicate swipe — ignore
        return NextResponse.json({ matched: false });
    }

    // Check mutual like
    const mutual = await prisma.swipe.findFirst({
        where: { swiperId: targetId, targetId: currentUser.id, swipeType: { in: ["like", "superlike"] }, },
    });

    let matched = false;
    if (mutual && swipeType !== "pass") {
        const targetUser = await prisma.user.findUnique({ where: { id: targetId }, include: { repositories: true } });
        const score = targetUser ? calculateCompatibility(currentUser, targetUser) : 0;

        try {
            await prisma.match.create({
                data: {
                    user1Id: currentUser.id < targetId ? currentUser.id : targetId,
                    user2Id: currentUser.id < targetId ? targetId : currentUser.id,
                    compatibilityScore: score,
                },
            });
            matched = true;
        } catch {
            matched = true; // Match already exists
        }
    }

    return NextResponse.json({ matched });
}

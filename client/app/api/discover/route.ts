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

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get all users this user has already swiped
    const swiped = await prisma.swipe.findMany({
        where: { swiperId: currentUser.id },
        select: { targetId: true },
    });
    const swipedIds = swiped.map((s) => s.targetId);
    swipedIds.push(currentUser.id); // exclude self

    const candidates = await prisma.user.findMany({
        where: {
            id: { notIn: swipedIds },
            ...(currentUser.intentMode === "dating" ? { hideDating: false } : {}),
        },
        include: { repositories: true },
        take: 50,
    });

    const scored = candidates
        .map((c) => ({
            ...c,
            compatibilityScore: calculateCompatibility(currentUser, c),
            location: c.hideLocation ? null : c.location,
        }))
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 20);

    return NextResponse.json(scored);
}

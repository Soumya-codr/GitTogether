import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

async function getCurrentUser(session: any) {
    if (!session?.user?.username) return null;
    return prisma.user.findUnique({ where: { username: session.user.username } });
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const matches = await prisma.match.findMany({
        where: {
            OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }],
        },
        include: {
            user1: { select: { id: true, username: true, name: true, avatarUrl: true, primaryStack: true } },
            user2: { select: { id: true, username: true, name: true, avatarUrl: true, primaryStack: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const formatted = matches.map((m) => ({
        id: m.id,
        compatibilityScore: m.compatibilityScore,
        createdAt: m.createdAt,
        partner: m.user1Id === currentUser.id ? m.user2 : m.user1,
    }));

    return NextResponse.json(formatted);
}

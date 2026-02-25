import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

async function getCurrentUser(session: any) {
    if (!session?.user?.username) return null;
    return prisma.user.findUnique({ where: { username: session.user.username } });
}

async function validateAccess(userId: string, matchId: string) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    return match && (match.user1Id === userId || match.user2Id === userId);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { matchId } = await params;
    if (!(await validateAccess(currentUser.id, matchId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
        where: { matchId },
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { username: true, avatarUrl: true } } },
    });

    return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { matchId } = await params;
    if (!(await validateAccess(currentUser.id, matchId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { messageText } = await req.json();
    if (!messageText?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const message = await prisma.message.create({
        data: { matchId, senderId: currentUser.id, messageText },
        include: { sender: { select: { username: true, avatarUrl: true } } },
    });

    return NextResponse.json(message);
}

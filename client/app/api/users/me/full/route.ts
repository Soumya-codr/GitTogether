import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.user?.name && !(session as any).user?.username) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const username = (session as any).user?.username || session.user?.name;

    const user = await prisma.user.findUnique({
        where: { username },
        include: { repositories: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
}

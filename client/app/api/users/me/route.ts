import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

async function getCurrentUser(session: any) {
    const username = session?.user?.username || session?.user?.name;
    if (!username) return null;
    return prisma.user.findUnique({
        where: { username },
        include: { repositories: true },
    });
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(currentUser);
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const allowed = ["intentMode", "hideLocation", "hideDating"];
    const update: Record<string, any> = {};
    for (const key of allowed) {
        if (key in body) update[key] = body[key];
    }

    const updated = await prisma.user.update({ where: { id: currentUser.id }, data: update });
    return NextResponse.json(updated);
}

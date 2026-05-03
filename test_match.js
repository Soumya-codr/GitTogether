const prisma = require('./server/lib/prisma');
async function main() {
    const user = await prisma.user.findFirst({ where: { username: "Soumya-codr" } });
    if (!user) return console.log("User not found");
    const others = await prisma.user.findMany({ where: { id: { not: user.id } }, take: 1 });
    if (!others.length) return console.log("No other users");
    const other = others[0];
    
    // Create mutual like
    await prisma.swipe.upsert({
        where: { swiperId_targetId: { swiperId: other.id, targetId: user.id } },
        create: { swiperId: other.id, targetId: user.id, swipeType: "like" },
        update: { swipeType: "like" }
    });
    
    // Create match
    const [u1, u2] = [user.id, other.id].sort();
    await prisma.match.upsert({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        create: { user1Id: u1, user2Id: u2, compatibilityScore: 99 },
        update: { compatibilityScore: 99 }
    });
    
    console.log("Created mutual match with", other.username);
}
main().catch(console.error).finally(() => prisma.$disconnect());

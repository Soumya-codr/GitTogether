require('dotenv').config();
const prisma = require('./lib/prisma');
async function main() {
    console.log("Resetting all swipes for Soumya-codr so they can see cards again...");
    const user = await prisma.user.findFirst({ where: { username: "Soumya-codr" } });
    if (!user) return console.log("User not found");
    
    await prisma.swipe.deleteMany({ where: { swiperId: user.id } });
    await prisma.match.deleteMany({
        where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] }
    });
    
    console.log("Deleted all swipes and matches. Now creating a mutual match!");
    
    const others = await prisma.user.findMany({ where: { id: { not: user.id } }, take: 2 });
    if (!others.length) return console.log("No other users");
    
    // Create mutual like with first user
    const other = others[0];
    await prisma.swipe.create({ data: { swiperId: other.id, targetId: user.id, swipeType: "like" } });
    await prisma.swipe.create({ data: { swiperId: user.id, targetId: other.id, swipeType: "like" } });
    
    const [u1, u2] = [user.id, other.id].sort();
    await prisma.match.create({
        data: { user1Id: u1, user2Id: u2, compatibilityScore: 99 }
    });
    
    // Create a pending like from second user
    if (others[1]) {
        await prisma.swipe.create({ data: { swiperId: others[1].id, targetId: user.id, swipeType: "superlike" } });
    }
    
    console.log("Done! You should now have 1 mutual match, 1 pending like, and several discover cards.");
}
main().catch(console.error).finally(() => prisma.$disconnect());

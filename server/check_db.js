const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const swipeCount = await prisma.swipe.count();
        const matchCount = await prisma.match.count();
        const allUsers = await prisma.user.findMany({ select: { id: true, username: true, intentMode: true } });
        const allSwipes = await prisma.swipe.findMany();

        console.log(`📊 DB Stats:`);
        console.log(`- Users: ${userCount}`);
        console.log(`- Swipes: ${swipeCount}`);
        console.log(`- Matches: ${matchCount}`);
        console.log(`\n👥 Users:`, JSON.stringify(allUsers, null, 2));
        console.log(`\n🧤 Swipes:`, JSON.stringify(allSwipes, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

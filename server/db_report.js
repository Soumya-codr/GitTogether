const prisma = require('./lib/prisma');
const fs = require('fs');

async function main() {
    try {
        const userCount = await prisma.user.count();
        const swipeCount = await prisma.swipe.count();
        const matchCount = await prisma.match.count();
        const allUsers = await prisma.user.findMany({ 
            select: { id: true, username: true, intentMode: true, hideDating: true } 
        });
        const allSwipes = await prisma.swipe.findMany();

        const report = {
            stats: { userCount, swipeCount, matchCount },
            users: allUsers,
            swipes: allSwipes
        };

        fs.writeFileSync('/tmp/db_report.json', JSON.stringify(report, null, 2));
        console.log("✅ Report written to /tmp/db_report.json");
    } catch (e) {
        console.error(e);
        fs.writeFileSync('/tmp/db_report.json', JSON.stringify({ error: e.message, stack: e.stack }, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();

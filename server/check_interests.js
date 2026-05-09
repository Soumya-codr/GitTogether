const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkInterests() {
    console.log("📊 Checking Hackathon Interests in DB...");
    const interests = await prisma.hackathonInterest.findMany({
        include: {
            user: { select: { username: true } },
            hackathon: { select: { name: true } }
        }
    });

    if (interests.length === 0) {
        console.log("❌ No interests found in database.");
    } else {
        console.log(`✅ Found ${interests.length} interests:`);
        interests.forEach(i => {
            console.log(`  - ${i.user.username} joined ${i.hackathon.name}`);
        });
    }
    process.exit(0);
}

checkInterests();

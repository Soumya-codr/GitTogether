// Restore data - mapping backup columns to main schema
const { Client } = require("pg");

const BACKUP_URL = "postgresql://neondb_owner:npg_GRgIyzku41Fs@ep-young-base-ai0cs2hh-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";
const MAIN_URL = "postgresql://neondb_owner:npg_GRgIyzku41Fs@ep-withered-pond-ai5a0tdo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function restore() {
    const backupDb = new Client({ connectionString: BACKUP_URL, ssl: { rejectUnauthorized: false } });
    const mainDb = new Client({ connectionString: MAIN_URL, ssl: { rejectUnauthorized: false } });

    await backupDb.connect();
    await mainDb.connect();
    console.log("✅ Connected to both databases\n");

    // ---- 1. USERS ----
    console.log("📦 Restoring Users...");
    const users = await backupDb.query('SELECT * FROM "User"');
    let userCount = 0;
    for (const u of users.rows) {
        try {
            await mainDb.query(
                `INSERT INTO "User" ("id", "username", "name", "bio", "avatarUrl", "githubId", "location", "primaryStack", "intentMode", "password", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT DO NOTHING`,
                [u.id, u.username, u.name, u.bio, u.avatarUrl, u.githubId, u.location, u.primaryStack, u.intentMode, "oauth_user", u.createdAt, u.updatedAt]
            );
            userCount++;
        } catch (e) {
            console.log(`  ⚠️ Skip user ${u.username}: ${e.message}`);
        }
    }
    console.log(`  ✅ Restored ${userCount}/${users.rows.length} users\n`);

    // ---- 2. REPOSITORIES ----
    console.log("📦 Restoring Repositories...");
    // Check backup repo schema
    const repoColsRes = await backupDb.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Repository' ORDER BY ordinal_position`);
    const repoCols = repoColsRes.rows.map(r => r.column_name);
    console.log("  Backup repo columns:", repoCols.join(", "));
    
    const repos = await backupDb.query('SELECT * FROM "Repository"');
    let repoCount = 0;
    for (const r of repos.rows) {
        try {
            await mainDb.query(
                `INSERT INTO "Repository" ("id", "userId", "name", "description", "url", "stars", "language", "topics")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
                [r.id, r.userId, r.name || r.repoName || "unnamed", r.description, r.url || r.repoUrl || "", r.stars || r.stargazersCount || 0, r.language || r.primaryLanguage || null, r.topics || []]
            );
            repoCount++;
        } catch (e) {
            console.log(`  ⚠️ Skip repo: ${e.message}`);
        }
    }
    console.log(`  ✅ Restored ${repoCount}/${repos.rows.length} repos\n`);

    // ---- 3. SWIPES ----
    console.log("📦 Restoring Swipes...");
    const swipeColsRes = await backupDb.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Swipe' ORDER BY ordinal_position`);
    console.log("  Backup swipe columns:", swipeColsRes.rows.map(r => r.column_name).join(", "));

    const swipes = await backupDb.query('SELECT * FROM "Swipe"');
    let swipeCount = 0;
    for (const s of swipes.rows) {
        try {
            await mainDb.query(
                `INSERT INTO "Swipe" ("id", "swiperId", "targetId", "swipeType", "createdAt")
                 VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
                [s.id, s.swiperId, s.targetId, s.swipeType, s.createdAt]
            );
            swipeCount++;
        } catch (e) {
            console.log(`  ⚠️ Skip swipe: ${e.message}`);
        }
    }
    console.log(`  ✅ Restored ${swipeCount}/${swipes.rows.length} swipes\n`);

    // ---- 4. MATCHES ----
    console.log("📦 Restoring Matches...");
    const matchColsRes = await backupDb.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Match' ORDER BY ordinal_position`);
    console.log("  Backup match columns:", matchColsRes.rows.map(r => r.column_name).join(", "));

    const matches = await backupDb.query('SELECT * FROM "Match"');
    let matchCount = 0;
    for (const m of matches.rows) {
        try {
            await mainDb.query(
                `INSERT INTO "Match" ("id", "user1Id", "user2Id", "compatibilityScore", "status", "createdAt")
                 VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
                [m.id, m.user1Id, m.user2Id, m.compatibilityScore || 0, m.status || "active", m.createdAt]
            );
            matchCount++;
        } catch (e) {
            console.log(`  ⚠️ Skip match: ${e.message}`);
        }
    }
    console.log(`  ✅ Restored ${matchCount}/${matches.rows.length} matches\n`);

    // ---- 5. MESSAGES ----
    console.log("📦 Restoring Messages...");
    const messages = await backupDb.query('SELECT * FROM "Message"');
    let msgCount = 0;
    for (const msg of messages.rows) {
        try {
            await mainDb.query(
                `INSERT INTO "Message" ("id", "matchId", "senderId", "messageText", "createdAt")
                 VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
                [msg.id, msg.matchId, msg.senderId, msg.messageText || msg.content || "", msg.createdAt]
            );
            msgCount++;
        } catch (e) {
            console.log(`  ⚠️ Skip message: ${e.message}`);
        }
    }
    console.log(`  ✅ Restored ${msgCount}/${messages.rows.length} messages\n`);

    // ---- 6. HACKATHONS ----
    console.log("📦 Restoring Hackathons...");
    const hackathons = await backupDb.query('SELECT * FROM "Hackathon"');
    let hCount = 0;
    for (const h of hackathons.rows) {
        try {
            await mainDb.query(
                `INSERT INTO "Hackathon" ("id", "name", "description", "startDate", "endDate", "mode", "prizePool", "themes", "techTags", "organizer", "website", "imageUrl", "featured", "createdAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT DO NOTHING`,
                [h.id, h.name, h.description, h.startDate, h.endDate, h.mode, h.prizePool, h.themes, h.techTags, h.organizer, h.website, h.imageUrl, h.featured, h.createdAt]
            );
            hCount++;
        } catch (e) {
            console.log(`  ⚠️ Skip hackathon ${h.name}: ${e.message}`);
        }
    }
    console.log(`  ✅ Restored ${hCount}/${hackathons.rows.length} hackathons\n`);

    // ---- 7. HACKATHON INTERESTS & SWIPES ----
    console.log("📦 Restoring Hackathon Interactions...");
    try {
        const hInterests = await backupDb.query('SELECT * FROM "HackathonInterest"');
        let hiCount = 0;
        for (const hi of hInterests.rows) {
            await mainDb.query(`INSERT INTO "HackathonInterest" ("id", "userId", "hackathonId", "createdAt") VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`, [hi.id, hi.userId, hi.hackathonId, hi.createdAt]);
            hiCount++;
        }
        console.log(`  ✅ Restored ${hiCount} interests`);
    } catch (e) { console.log("  ⚠️ HackathonInterest table might not exist in backup"); }

    try {
        const hSwipes = await backupDb.query('SELECT * FROM "HackathonSwipe"');
        let hsCount = 0;
        for (const hs of hSwipes.rows) {
            await mainDb.query(`INSERT INTO "HackathonSwipe" ("id", "userId", "hackathonId", "swipeType", "createdAt") VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`, [hs.id, hs.userId, hs.hackathonId, hs.swipeType, hs.createdAt]);
            hsCount++;
        }
        console.log(`  ✅ Restored ${hsCount} hackathon swipes`);
    } catch (e) { console.log("  ⚠️ HackathonSwipe table might not exist in backup"); }

    // ---- 8. REPO SWIPES & MESSAGES ----
    console.log("📦 Restoring Repo Interactions...");
    try {
        const rSwipes = await backupDb.query('SELECT * FROM "RepoSwipe"');
        for (const rs of rSwipes.rows) {
            await mainDb.query(`INSERT INTO "RepoSwipe" ("id", "userId", "repoId", "swipeType", "createdAt") VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`, [rs.id, rs.userId, rs.repoId, rs.swipeType, rs.createdAt]);
        }
    } catch (e) { console.log("  ⚠️ RepoSwipe table might not exist in backup"); }

    try {
        const rMsgs = await backupDb.query('SELECT * FROM "RepoMessage"');
        for (const rm of rMsgs.rows) {
            await mainDb.query(`INSERT INTO "RepoMessage" ("id", "repoId", "senderId", "messageText", "createdAt") VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`, [rm.id, rm.repoId, rm.senderId, rm.messageText, rm.createdAt]);
        }
    } catch (e) { console.log("  ⚠️ RepoMessage table might not exist in backup"); }

    console.log("\n🎉 Data restoration complete!");
    await backupDb.end();
    await mainDb.end();
    process.exit(0);
}

restore().catch(err => {
    console.error("❌ Restore failed:", err.message);
    process.exit(1);
});

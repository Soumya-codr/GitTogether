const { Client } = require("pg");
const MAIN_URL = "postgresql://neondb_owner:npg_GRgIyzku41Fs@ep-withered-pond-ai5a0tdo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function check() {
    const client = new Client({ connectionString: MAIN_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    console.log("Tables in production DB:");
    res.rows.forEach(r => console.log(`  - ${r.table_name}`));
    await client.end();
}
check();

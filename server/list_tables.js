const { Client } = require("pg");
const BACKUP_URL = "postgresql://neondb_owner:npg_GRgIyzku41Fs@ep-young-base-ai0cs2hh-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function listTables() {
    const client = new Client({ connectionString: BACKUP_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log("Tables in backup DB:", res.rows.map(r => r.table_name).join(", "));
    await client.end();
}

listTables();

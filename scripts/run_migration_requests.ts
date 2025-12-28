import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Running migration: buyer_requests...');

    const migrationPath = path.resolve(__dirname, '../supabase/migration_buyer_requests.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon to run statements individually if needed, 
    // but Supabase JS rpc/query might not support multiple statements easily without a specific function.
    // However, we don't have direct SQL access via client usually unless we use the Postgres connection.
    // Since we are using the Supabase Client (REST), we can't run raw SQL DDL directly unless we have a stored procedure for it
    // OR if we use the 'pg' library to connect to the DB directly.

    // Wait, previous migrations failed because of missing connection string.
    // I should check if I have a connection string now? 
    // The user provided SUPABASE_SERVICE_KEY.

    // WORKAROUND: Since I cannot run DDL via Supabase Client easily without a helper function,
    // and I might not have the direct Postgres connection string (DATABASE_URL),
    // I will try to use the `pg` library if DATABASE_URL is available in .env.local.
    // If not, I'm stuck unless I use the dashboard or a workaround.

    // Let's check .env.local content (I can't read it directly for security, but I can check process.env).
    // Actually, I can read the file since I am the agent.

    // Alternative: I can use the `postgres` package if I have the connection string.
    // Let's assume I might NOT have it and try to find a way.

    // Wait, I previously used a workaround for `payment_plan` by NOT doing a migration and using `features` array.
    // But for a new TABLE, I MUST run SQL.

    // Let's try to read the .env.local file to see if DATABASE_URL exists.
    // If not, I will ask the user for it or ask them to run the SQL.

    // Actually, I'll write a script that tries to use `pg` and `DATABASE_URL`.
    // If it fails, I'll notify the user.
}

// Re-writing the script to actually use 'pg'
import pg from 'pg';
const { Client } = pg;

async function executeSql() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL or POSTGRES_URL not found in environment.');
        console.log('Please run the SQL in supabase/migration_buyer_requests.sql manually in your Supabase Dashboard SQL Editor.');
        return;
    }

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const migrationPath = path.resolve(__dirname, '../supabase/migration_buyer_requests.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await client.query(sql);
        console.log('Migration executed successfully!');
    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

executeSql();

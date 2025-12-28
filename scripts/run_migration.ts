import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runMigration() {
    // Try to get connection string from env
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('DATABASE_URL or POSTGRES_URL not found in .env.local');
        // Fallback: try to construct it if we have other vars, or just fail
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Often needed for hosted DBs
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const sqlPath = path.join(__dirname, '../supabase/migration_add_payment_plan.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();

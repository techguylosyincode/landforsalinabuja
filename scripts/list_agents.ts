import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

async function listAgents() {
    console.log('Fetching agents from database...\n');

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, agency_name, phone_number, is_verified');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Agents found:', data?.length || 0);
    console.log(JSON.stringify(data, null, 2));
}

listAgents();

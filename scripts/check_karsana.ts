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
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKarsana() {
    console.log('Checking for Karsana...');
    const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('slug', 'karsana');

    if (error) {
        console.error(error);
    } else {
        console.log('Result:', data);
    }
}

checkKarsana();

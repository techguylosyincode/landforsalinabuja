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

async function checkSpecificDistricts() {
    const targets = ['karsana', 'idu', 'lugbe', 'katampe'];

    const { data, error } = await supabase
        .from('districts')
        .select('slug, name')
        .in('slug', targets);

    if (error) {
        console.error(error);
        return;
    }

    const found = data.map(d => d.slug);
    console.log('Found:', found);

    targets.forEach(t => {
        if (!found.includes(t)) {
            console.log(`Missing: ${t}`);
        }
    });
}

checkSpecificDistricts();

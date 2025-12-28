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

async function checkPropertyDistricts() {
    console.log('Checking property distribution by district...');

    const { data, error } = await supabase
        .from('properties')
        .select('district');

    if (error) {
        console.error('Error fetching properties:', error);
        return;
    }

    const distribution: Record<string, number> = {};
    data.forEach((p: any) => {
        const dist = p.district ? p.district.toLowerCase() : 'unknown';
        distribution[dist] = (distribution[dist] || 0) + 1;
    });

    console.log('Property Count by District:', distribution);
}

checkPropertyDistricts();

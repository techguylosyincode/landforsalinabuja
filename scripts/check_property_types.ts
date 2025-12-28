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

async function checkPropertyTypes() {
    console.log('Checking property types distribution...');

    const { data, error } = await supabase
        .from('properties')
        .select('type, id');

    if (error) {
        console.error('Error fetching properties:', error);
        return;
    }

    const distribution = data.reduce((acc: any, curr: any) => {
        const type = curr.type || 'undefined';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    console.log('Property Type Distribution:', distribution);
}

checkPropertyTypes();

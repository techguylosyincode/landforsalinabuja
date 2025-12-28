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

async function checkImages() {
    console.log('Checking property images...');

    const { data, error } = await supabase
        .from('properties')
        .select('id, title, images, slug')
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(p => {
        console.log(`Title: ${p.title}`);
        console.log(`Slug: ${p.slug}`);
        console.log(`Images:`, p.images);
        console.log('---');
    });
}

checkImages();

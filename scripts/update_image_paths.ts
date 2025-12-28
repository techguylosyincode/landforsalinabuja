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

async function updateImagePaths() {
    console.log('Updating image paths to root...');

    const images = [
        "/mshel-oasis/image-0.jpg",
        "/mshel-oasis/image-1.jpg",
        "/mshel-oasis/image-2.jpg",
        "/mshel-oasis/image-3.jpg",
        "/mshel-oasis/image-4.jpg"
    ];

    const { error } = await supabase
        .from('properties')
        .update({ images: images })
        .eq('slug', 'luxury-5-bedroom-fully-detached-duplex-mshel-oasis-court-guzape');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Image paths updated.');
    }
}

updateImagePaths();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const projectRoot = path.resolve(__dirname, '../');
const targetDir = path.join(projectRoot, 'public', 'mshel-oasis');

// New images uploaded by user
const sourceImages = [
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_0_1766871262913.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_1_1766871262913.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_2_1766871262913.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_3_1766871262913.jpg"
];

async function addNewImages() {
    console.log('Adding new images...');

    // 1. Copy images to public folder
    const newImagePaths: string[] = [];
    // Start index from 5 since we already have 0-4
    let startIndex = 5;

    sourceImages.forEach((src, index) => {
        const fileName = `image-${startIndex + index}.jpg`;
        const dest = path.join(targetDir, fileName);
        try {
            fs.copyFileSync(src, dest);
            console.log(`Copied ${src} to ${dest}`);
            newImagePaths.push(`/mshel-oasis/${fileName}`);
        } catch (err) {
            console.error(`Error copying ${src}:`, err);
        }
    });

    // 2. Update Database
    // Fetch existing images first
    const { data: property } = await supabase
        .from('properties')
        .select('images')
        .eq('slug', 'luxury-5-bedroom-fully-detached-duplex-mshel-oasis-court-guzape')
        .single();

    if (property) {
        const currentImages = property.images || [];
        // Combine and deduplicate just in case, though names are unique
        const updatedImages = [...currentImages, ...newImagePaths];

        const { error } = await supabase
            .from('properties')
            .update({ images: updatedImages })
            .eq('slug', 'luxury-5-bedroom-fully-detached-duplex-mshel-oasis-court-guzape');

        if (error) {
            console.error('Error updating DB:', error);
        } else {
            console.log('Successfully updated database with new images:', newImagePaths);
        }
    } else {
        console.error('Property not found.');
    }
}

addNewImages();

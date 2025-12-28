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

// Single new image from user
const sourceImage = "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_1766871866660.png";

async function addMissingImage() {
    console.log('Adding missing image...');

    // 1. Copy image to public folder
    // We have images 0-8 (9 images). Next is image-9.jpg
    const nextIndex = 9;
    const fileName = `image-${nextIndex}.jpg`; // Convert to jpg extension for consistency if needed, or keep png
    // Let's keep original extension if possible, but code expects consistency? 
    // Actually the previous script used .jpg for everything. The input is .png.
    // I'll save as .png to match source, but name it image-9.png
    const destFileName = `image-${nextIndex}.png`;
    const dest = path.join(targetDir, destFileName);

    try {
        fs.copyFileSync(sourceImage, dest);
        console.log(`Copied ${sourceImage} to ${dest}`);

        const newImagePath = `/mshel-oasis/${destFileName}`;

        // 2. Update Database
        const { data: property } = await supabase
            .from('properties')
            .select('images')
            .eq('slug', 'luxury-5-bedroom-fully-detached-duplex-mshel-oasis-court-guzape')
            .single();

        if (property) {
            const currentImages = property.images || [];
            const updatedImages = [...currentImages, newImagePath];

            const { error } = await supabase
                .from('properties')
                .update({ images: updatedImages })
                .eq('slug', 'luxury-5-bedroom-fully-detached-duplex-mshel-oasis-court-guzape');

            if (error) {
                console.error('Error updating DB:', error);
            } else {
                console.log('Successfully updated database with new image:', newImagePath);
            }
        } else {
            console.error('Property not found.');
        }

    } catch (err) {
        console.error(`Error copying ${sourceImage}:`, err);
    }
}

addMissingImage();

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
const targetDir = path.join(projectRoot, 'public', 'mshel-oasis-scadens');

const sourceImages = [
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_0_1766872824718.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_1_1766872824718.jpg",
    "C:/Users/user/.gemini/antigravity/brain/d9c2ee35-2b1c-4cc0-bede-7370a0c27bdd/uploaded_image_2_1766872824718.jpg"
];

async function seedProperty() {
    console.log('Seeding Mshel Oasis Scadens property...');

    // 1. Create Directory and Copy Images
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const imagePaths: string[] = [];
    sourceImages.forEach((src, index) => {
        const fileName = `image-${index}.jpg`;
        const dest = path.join(targetDir, fileName);
        try {
            fs.copyFileSync(src, dest);
            console.log(`Copied ${src} to ${dest}`);
            imagePaths.push(`/mshel-oasis-scadens/${fileName}`);
        } catch (err) {
            console.error(`Error copying ${src}:`, err);
        }
    });

    // 2. Insert Property Data
    const propertyData = {
        title: "MSHEL Oasis Court - Block of Flats Land (Scadens)",
        price: 37611814,
        size_sqm: 950,
        district: "Scadens",
        address: "Scadens, Abuja",
        description: "Discover premium land for sale in Abuja at MSHEL Oasis Court, a prestigious development featuring an exceptional 950 sqm block of flats land. This premium property in the heart of Scadens, Abuja, offers an outstanding investment opportunity for developers and investors seeking high-value real estate. With 13 available units, this commercial land in Abuja is ideal for building blocks of flats or residential complexes. Located in a prime Abuja location, this land for sale provides excellent appreciation potential and rental income. Perfect for property investors looking for land for sale in Federal Territory, Abuja. Flexible payment plans available including outright purchase and installment.",
        images: imagePaths,
        title_type: "C_of_O",
        features: ["Block of Flats Land", "Premium Location", "High Appreciation Potential"],
        bedrooms: 0,
        bathrooms: 0,
        garages: 1,
        slug: "mshel-oasis-court-block-of-flats-land-scadens",
        status: "active",
        payment_plans: {
            outright: 37611814,
            installment: "Flexible plans available"
        }
    };

    // Agent Profile (A.I Realent Global Resources)
    // We need to link it to the agent. First find the agent profile.
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('agency_name', 'A.I Realent Global Resources')
        .single();

    if (profile) {
        // @ts-ignore
        propertyData.agent_id = profile.id;
    } else {
        console.warn('Agent profile not found. Creating property without specific agent_id.');
    }

    const { error } = await supabase
        .from('properties')
        .upsert(propertyData, { onConflict: 'slug' });

    if (error) {
        console.error('Error seeding property:', error);
    } else {
        console.log('Property seeded successfully.');
    }
}

seedProperty();

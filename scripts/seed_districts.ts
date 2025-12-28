import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { districtContent } from '../lib/district-content';

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

async function seedDistricts() {
    console.log('Seeding districts data...');

    for (const [slug, data] of Object.entries(districtContent)) {
        console.log(`Processing ${slug}...`);

        const districtPayload = {
            name: slug, // Using slug as name for now, or we could capitalize it
            slug: slug,
            description: data.description,
            image_url: data.heroImage,
            market_analysis: data.marketAnalysis,
            why_invest: data.whyInvest,
            infrastructure: data.infrastructure,
            faqs: data.faqs,
            // We might want to set a title too if the table has it, schema.sql said 'name' is unique.
            // Let's check schema again mentally: 
            // create table districts (id, name, description, avg_price_per_sqm, image_url...)
            // We added market_analysis, etc.
            // We should probably map 'averagePrice' to 'avg_price_per_sqm' if possible, but avg_price_per_sqm is numeric in schema?
            // In static file it's a string "₦150,000,000".
            // Let's just leave avg_price_per_sqm null for now and rely on the JSON market_analysis which has the formatted string.
        };

        const { error } = await supabase
            .from('districts')
            .upsert(districtPayload, { onConflict: 'slug' })
            .select();

        if (error) {
            // If slug constraint fails (maybe it wasn't added?), try name
            console.error(`Error inserting ${slug}:`, error.message);

            // Fallback: try upserting by name if slug failed (though we added slug column)
            // Actually, let's just log it.
        } else {
            console.log(`Successfully seeded ${slug}`);
        }
    }
}

seedDistricts();

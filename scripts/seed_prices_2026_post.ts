import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
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

async function seedPricesPost() {
    console.log('Seeding "Land Prices in Abuja 2026" blog post...');

    const content = fs.readFileSync(path.join(__dirname, 'blog_post_prices_2026_content.html'), 'utf-8');

    const post = {
        title: "Land Prices in Abuja 2026: Maitama, Kuje, & City Center Guide",
        slug: "land-prices-in-abuja-maitama-kuje-2026",
        category: "Market Analysis",
        image_url: "/images/blog/abuja-city-gate.jpg", // Reusing the city gate image
        excerpt: "How much is land in Abuja? We break down 2026 prices for Maitama (Luxury), Kuje (Affordable), and the general city center. Don't overpay.",
        meta_title: "Land Prices in Abuja 2026 | Maitama, Kuje & City Center Rates",
        meta_description: "How much is a plot of land in Abuja? 2026 Price Guide: Maitama from ₦600M, Kuje from ₦3M. See current market rates for all districts.",
        content: content,
        published: true,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('blog_posts')
        .upsert(post, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error(`Error inserting ${post.title}:`, error);
    } else {
        console.log(`Successfully inserted: ${post.title}`);
    }
}

seedPricesPost();

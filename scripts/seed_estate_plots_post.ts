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

async function seedEstatePlotsPost() {
    console.log('Seeding "Estate Plots for Sale in Abuja" blog post...');

    const content = fs.readFileSync(path.join(__dirname, 'blog_post_estate_plots_content.html'), 'utf-8');

    const post = {
        title: "Estate Plots for Sale in Abuja: Top 10 Secure Estates to Buy Into (2026)",
        slug: "estate-plots-for-sale-in-abuja",
        category: "Guide",
        image_url: "/images/blog/how-to-buy-land-abuja-estate-layout.jpg", // Reusing the estate layout image
        excerpt: "Looking for security and community? We rank the top 10 secure estates in Abuja for 2026, including Hutu Polo Golf Resort and Mshel Pent Haven.",
        meta_title: "Estate Plots for Sale in Abuja | Top 10 Secure Estates 2026",
        meta_description: "Find the best estate plots for sale in Abuja. Our 2026 guide ranks top secure estates like Hutu Polo Golf Resort and Mshel Pent Haven. Verified titles & infrastructure.",
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

seedEstatePlotsPost();

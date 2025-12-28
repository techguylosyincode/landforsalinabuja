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

async function seedPriceBenchmarkPost() {
    console.log('Seeding price benchmark blog post...');

    const content = fs.readFileSync(path.join(__dirname, 'blog_post_benchmarks_content.html'), 'utf-8');

    const post = {
        title: "Abuja Land Price Benchmarks 2026: What ₦20m, ₦50m, & ₦100m Buys",
        slug: "abuja-land-price-benchmarks-2026",
        category: "Market Trends",
        image_url: "/images/blog/abuja-city-gate.jpg", // Using local image path
        excerpt: "Budgeting for land in Abuja? We break down what ₦20M-₦100M buys in Karsana, Kubwa, Lokogoma, Idu, and Guzape in 2026.",
        meta_title: "Abuja Land Prices 2026: Karsana, Kubwa, Lokogoma & Idu Benchmarks",
        meta_description: "Real estate market analysis for Abuja 2026. See land prices in Karsana, Kubwa, Lokogoma, Idu (₦10M-₦50M) and luxury options in Guzape.",
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

seedPriceBenchmarkPost();

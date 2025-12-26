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

async function seedBestCompaniesPost() {
    console.log('Seeding "Best Real Estate Companies in Abuja" blog post...');

    const content = fs.readFileSync(path.join(__dirname, 'blog_post_best_companies_content.html'), 'utf-8');

    const post = {
        title: "Top 15 Best Real Estate Companies in Abuja 2025 (Expert Ranking)",
        slug: "best-real-estate-companies-in-abuja",
        category: "Guide",
        image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop", // Modern building
        excerpt: "Looking for a reliable real estate partner in Abuja? Our expert ranking of the top 15 companies includes A.I Realent, Brains & Hammers, Urban Shelter, and more. Find verified agents today.",
        meta_title: "Top 15 Best Real Estate Companies in Abuja 2025 | Expert Ranking",
        meta_description: "Discover the top 15 best real estate companies in Abuja for 2025. Our expert ranking covers verified developers from A.I Realent to Urban Shelter. Find your trusted partner.",
        content: content,
        published: true,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('blog_posts')
        .upsert(post, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('Error inserting post:', error);
    } else {
        console.log('Successfully inserted:', post.title);
    }
}

seedBestCompaniesPost();

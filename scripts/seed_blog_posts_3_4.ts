import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const content3 = fs.readFileSync(path.join(__dirname, 'blog_post_3_content.html'), 'utf-8');
const content4 = fs.readFileSync(path.join(__dirname, 'blog_post_4_content.html'), 'utf-8');

const posts = [
    {
        title: "C of O vs R of O: What Every Buyer Must Know",
        slug: "c-of-o-vs-r-of-o-abuja-explained",
        category: "Guide",
        image_url: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        excerpt: "Confused by land titles in Abuja? Discover the critical differences between Certificate of Occupancy (C of O) and Right of Occupancy (R of O) and which one is right for your investment.",
        meta_title: "C of O vs R of O Abuja: The Complete Guide for Buyers",
        meta_description: "What is the difference between C of O and R of O in Abuja? Learn which land title is better for investment, how to verify them, and how to avoid scams.",
        content: content3
    },
    {
        title: "Top 5 Areas for Land Investment in Abuja 2025",
        slug: "top-5-areas-land-investment-abuja-2025",
        category: "Market Trends",
        image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        excerpt: "Looking for high ROI? We analyze the top 5 developing districts in Abuja for land investment in 2025, including Idu, Guzape, and Katampe Extension.",
        meta_title: "Best Areas to Buy Land in Abuja 2025 | Investment Guide",
        meta_description: "Discover the top 5 districts for land investment in Abuja in 2025. From the luxury of Guzape to the industrial boom of Idu, find out where the smart money is going.",
        content: content4
    }
];

async function seed() {
    console.log('Seeding next batch of blog posts...');

    for (const post of posts) {
        console.log(`Processing: "${post.title}"...`);

        const { data: existing } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('slug', post.slug)
            .single();

        if (existing) {
            console.log('Updating existing post...');
            const { error } = await supabase
                .from('blog_posts')
                .update(post)
                .eq('id', existing.id);
            if (error) console.error(`Error updating ${post.title}:`, error);
        } else {
            console.log('Creating new post...');
            const { error } = await supabase
                .from('blog_posts')
                .insert([post]);
            if (error) console.error(`Error creating ${post.title}:`, error);
        }
    }
    console.log('Done!');
}

seed();

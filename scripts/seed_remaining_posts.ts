import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
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

async function seedRemainingPosts() {
    console.log('Seeding remaining blog posts...');

    // Read content files
    const scamsContent = fs.readFileSync(path.join(__dirname, 'blog_post_scams_content.html'), 'utf-8');
    const diasporaContent = fs.readFileSync(path.join(__dirname, 'blog_post_diaspora_content.html'), 'utf-8');

    const posts = [
        {
            title: "Land Scams in Abuja: How to Protect Yourself",
            slug: "land-scams-in-abuja-protection-guide",
            category: "Safety",
            image_url: "https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=1000&auto=format&fit=crop", // Security/Lock image
            excerpt: "Don't become a victim. Learn the top 4 scams targeting land buyers in Abuja and the exact checklist you need to avoid losing your money.",
            meta_title: "Land Scams in Abuja: How to Protect Yourself | Safety Guide",
            meta_description: "Avoid fake allocation papers and flash sale traps. A complete guide to spotting and avoiding land scams in Abuja real estate.",
            content: scamsContent,
            published: true,
            created_at: new Date().toISOString()
        },
        {
            title: "Why Diaspora Nigerians Are Investing in Abuja Land",
            slug: "why-diaspora-nigerians-invest-in-abuja",
            category: "Investment",
            image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop", // Modern building/Growth
            excerpt: "From dollar-pegged rental income to superior security, discover why Nigerians in the UK, US, and Canada are moving their capital to Abuja.",
            meta_title: "Why Diaspora Nigerians Are Investing in Abuja Land | 2025 Trends",
            meta_description: "Discover why Abuja is the #1 choice for diaspora real estate investment. High rental yields, security, and dollar-power advantages.",
            content: diasporaContent,
            published: true,
            created_at: new Date().toISOString()
        }
    ];

    for (const post of posts) {
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
}

seedRemainingPosts();

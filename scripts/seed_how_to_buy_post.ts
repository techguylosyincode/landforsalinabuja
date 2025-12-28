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

async function seedHowToBuyPost() {
    console.log('Seeding "How to Buy Land in Abuja" blog post...');

    const content = fs.readFileSync(path.join(__dirname, 'blog_post_how_to_buy_content.html'), 'utf-8');

    const post = {
        title: "How to Buy Land in Abuja: The Ultimate 2026 Guide (Expert Advice)",
        slug: "how-to-buy-land-in-abuja",
        category: "Guide",
        image_url: "/images/blog/how-to-buy-land-abuja-aerial-view.jpg",
        excerpt: "Looking to buy land in Abuja? This expert guide covers everything from C of O vs R of O, top locations for 2026, to avoiding scams. Read before you invest.",
        meta_title: "How to Buy Land in Abuja | 2026 Expert Guide & Prices",
        meta_description: "Learn how to buy land in Abuja safely. Expert guide on land titles (C of O), best locations (Lugbe, Idu, Guzape), prices, and avoiding scams in 2026.",
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

seedHowToBuyPost();

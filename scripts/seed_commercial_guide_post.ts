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

async function seedCommercialGuidePost() {
    console.log('Seeding commercial guide blog post...');

    const content = fs.readFileSync(path.join(__dirname, 'blog_post_commercial_guide_content.html'), 'utf-8');

    const post = {
        title: "Abuja Commercial Land Investment Guide 2026",
        slug: "abuja-commercial-land-investment-guide-2026",
        category: "Investment",
        image_url: "/images/blog/abuja-city-gate.jpg", // Using generic city gate image
        excerpt: "Where should you build your hotel, plaza, or factory in Abuja? We analyze the best districts for commercial investment in 2026.",
        meta_title: "Commercial Land for Sale Abuja: 2026 Investment Guide",
        meta_description: "Best locations for commercial land in Abuja. Guide for hotels (Guzape), plazas (Lugbe/Gwarinpa), and factories (Idu). ROI analysis included.",
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

seedCommercialGuidePost();

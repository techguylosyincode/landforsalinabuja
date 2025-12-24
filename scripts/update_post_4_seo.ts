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

const content = fs.readFileSync(path.join(__dirname, 'blog_post_4_content.html'), 'utf-8');

const update = {
    slug: 'top-5-areas-land-investment-abuja-2025',
    title: 'Top 5 Areas for Land Investment in Abuja 2025 (Expert Analysis)',
    content: content,
    image_url: '/images/blog/guzape-luxury.jpg',
    meta_description: 'Discover the top 5 districts for land investment in Abuja in 2025. From the luxury of Guzape to the industrial boom of Idu, find out where to invest for maximum ROI.',
    excerpt: 'Looking for high ROI? We analyze the top 5 developing districts in Abuja for land investment in 2025, including Idu, Guzape, and Katampe Extension. Learn where the smart money is going.'
};

async function updatePost() {
    console.log(`Updating "${update.title}"...`);

    const { error } = await supabase
        .from('blog_posts')
        .update({
            title: update.title,
            content: update.content,
            image_url: update.image_url,
            meta_description: update.meta_description,
            excerpt: update.excerpt
        })
        .eq('slug', update.slug);

    if (error) {
        console.error(`Error updating post:`, error);
    } else {
        console.log(`Updated successfully!`);
    }
}

updatePost();

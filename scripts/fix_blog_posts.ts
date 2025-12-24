import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

const images = [
    '/images/blog/blog-1.png',
    '/images/blog/blog-2.png',
    '/images/blog/blog-3.png',
    '/images/blog/blog-4.png'
];

async function fixPosts() {
    console.log('Fetching all posts...');
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Found ${posts.length} posts. Updating...`);

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const image = images[i % images.length]; // Cycle through images

        console.log(`Updating "${post.title}"...`);

        const { error: updateError } = await supabase
            .from('blog_posts')
            .update({
                published: true,
                image_url: image
            })
            .eq('id', post.id);

        if (updateError) {
            console.error(`Error updating post ${post.id}:`, updateError);
        } else {
            console.log(`Updated successfully! Image: ${image}`);
        }
    }
    console.log('All done!');
}

fixPosts();

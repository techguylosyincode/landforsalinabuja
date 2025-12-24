import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPosts() {
    console.log('Checking blog posts...');
    const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published, image_url');

    if (error) {
        console.error('Error fetching posts:', error);
    } else {
        console.log('Found posts:', data);
    }
}

checkPosts();

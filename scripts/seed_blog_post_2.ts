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

const content = fs.readFileSync(path.join(__dirname, 'blog_post_2_content.html'), 'utf-8');

const blogPost = {
  title: "How to Get More Serious Land Buyers in Abuja (Without Wasting Money on Ads)",
  slug: "how-to-get-serious-land-buyers-in-abuja",
  category: "Agent Tips",
  image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  excerpt: "Struggling to find serious land buyers in Abuja? Learn expert strategies to attract qualified leads, build trust, and close deals without blowing your budget on ads.",
  meta_title: "How to Get Serious Land Buyers in Abuja | Real Estate Agent Guide",
  meta_description: "Struggling to find serious land buyers in Abuja? Learn the expert strategies to attract qualified leads, build trust, and close deals without blowing your budget on ads.",
  content: content
};

async function seedBlogPost() {
  console.log(`Seeding blog post: "${blogPost.title}"...`);

  // Check if post exists
  const { data: existingPost } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', blogPost.slug)
    .single();

  if (existingPost) {
    console.log('Post already exists. Updating...');
    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: blogPost.title,
        content: blogPost.content,
        category: blogPost.category,
        image_url: blogPost.image_url,
        excerpt: blogPost.excerpt,
        meta_title: blogPost.meta_title,
        meta_description: blogPost.meta_description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingPost.id);

    if (error) {
      console.error('Error updating post:', error);
    } else {
      console.log('Post updated successfully!');
    }
  } else {
    console.log('Creating new post...');
    const { error } = await supabase
      .from('blog_posts')
      .insert([blogPost]);

    if (error) {
      console.error('Error creating post:', error);
    } else {
      console.log('Post created successfully!');
    }
  }
}

seedBlogPost();

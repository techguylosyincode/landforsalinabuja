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

const updates = [
    {
        slug: 'how-to-verify-c-of-o-abuja',
        image_url: '/images/blog/verify-c-of-o.jpg'
    },
    {
        slug: 'top-developing-areas-abuja-2025',
        image_url: '/images/blog/top-areas-2025.png'
    },
    {
        slug: 'how-to-verify-land-title-in-abuja',
        image_url: '/images/blog/verify-land-title.png'
    },
    {
        slug: 'how-to-get-serious-land-buyers-in-abuja',
        image_url: '/images/blog/serious-buyers.png'
    },
    {
        slug: 'c-of-o-vs-r-of-o-abuja-explained',
        image_url: '/images/blog/c-of-o-vs-r-of-o.png'
    },
    {
        slug: 'top-5-areas-land-investment-abuja-2025',
        image_url: '/images/blog/top-5-investment.png'
    }
];

async function updateImages() {
    console.log('Updating blog post images...');

    for (const update of updates) {
        console.log(`Updating "${update.slug}"...`);

        const { error } = await supabase
            .from('blog_posts')
            .update({
                image_url: update.image_url
            })
            .eq('slug', update.slug);

        if (error) {
            console.error(`Error updating ${update.slug}:`, error);
        } else {
            console.log(`Updated successfully!`);
        }
    }
    console.log('All done!');
}

updateImages();

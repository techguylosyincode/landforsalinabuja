import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://landforsaleinabuja.ng';

// Top districts with rich landing pages
const DISTRICTS = [
    'maitama',
    'asokoro',
    'guzape',
    'wuse-ii',
    'gwarinpa',
    'lugbe',
    'katampe',
    'idu',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static routes (always included, even if DB fails)
    const staticRoutes = [
        { route: '', priority: 1.0, changeFrequency: 'daily' as const },
        { route: '/buy', priority: 0.9, changeFrequency: 'daily' as const },
        { route: '/sell', priority: 0.8, changeFrequency: 'weekly' as const },
        { route: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
        { route: '/pricing', priority: 0.6, changeFrequency: 'monthly' as const },
    ].map(({ route, priority, changeFrequency }) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    // District landing pages (always included)
    const districtRoutes = DISTRICTS.map((district) => ({
        url: `${BASE_URL}/buy/${district}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }));

    let propertyRoutes: MetadataRoute.Sitemap = [];
    let blogRoutes: MetadataRoute.Sitemap = [];

    // Only fetch from DB if env vars are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey);

            // Fetch properties with timeout
            const { data: properties } = await supabase
                .from('properties')
                .select('slug, district, created_at')
                .eq('status', 'active')
                .limit(500);

            propertyRoutes = (properties || []).map((property) => ({
                url: `${BASE_URL}/buy/${property.district?.toLowerCase() || 'abuja'}/${property.slug}`,
                lastModified: new Date(property.created_at || Date.now()),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));

            // Fetch blog posts
            const { data: posts } = await supabase
                .from('blog_posts')
                .select('slug, created_at')
                .eq('published', true)
                .limit(100);

            blogRoutes = (posts || []).map((post) => ({
                url: `${BASE_URL}/blog/${post.slug}`,
                lastModified: new Date(post.created_at || Date.now()),
                changeFrequency: 'weekly' as const,
                priority: 0.75,
            }));
        } catch (error) {
            console.error('Sitemap DB error:', error);
            // Continue with static routes only
        }
    }

    return [...staticRoutes, ...districtRoutes, ...propertyRoutes, ...blogRoutes];
}

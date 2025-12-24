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
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch all active properties
    const { data: properties } = await supabase
        .from('properties')
        .select('slug, district, created_at')
        .eq('status', 'active');

    // Fetch all blog posts
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, created_at')
        .eq('published', true);

    // Static routes (high priority pages)
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

    // District landing pages (SEO Power-Up pages)
    const districtRoutes = DISTRICTS.map((district) => ({
        url: `${BASE_URL}/buy/${district}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }));

    // Property routes
    const propertyRoutes = (properties || []).map((property) => ({
        url: `${BASE_URL}/buy/${property.district?.toLowerCase()}/${property.slug}`,
        lastModified: new Date(property.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Blog routes
    const blogRoutes = (posts || []).map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
    }));

    return [...staticRoutes, ...districtRoutes, ...propertyRoutes, ...blogRoutes];
}

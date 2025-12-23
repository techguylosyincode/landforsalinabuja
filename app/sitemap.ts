import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';

const BASE_URL = 'https://landforsaleinabuja.ng';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient();

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

    // Static routes
    const routes = [
        '',
        '/buy',
        '/sell',
        '/blog',
        '/pricing',
        '/auth/login',
        '/auth/signup',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Property routes
    const propertyRoutes = (properties || []).map((property) => ({
        url: `${BASE_URL}/buy/${property.district}/${property.slug}`,
        lastModified: new Date(property.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    // Blog routes
    const blogRoutes = (posts || []).map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...routes, ...propertyRoutes, ...blogRoutes];
}

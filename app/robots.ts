import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/agent/', '/auth/'],
        },
        sitemap: 'https://landforsaleinabuja.ng/sitemap.xml',
    };
}

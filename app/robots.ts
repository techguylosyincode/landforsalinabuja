import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/agent/',
                    '/auth/',
                    '/api/',
                    '/_next/',
                    '/scripts/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/agent/', '/auth/', '/api/'],
            },
        ],
        sitemap: 'https://landforsaleinabuja.ng/sitemap.xml',
        host: 'https://landforsaleinabuja.ng',
    };
}

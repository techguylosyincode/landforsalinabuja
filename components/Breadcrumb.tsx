import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export type BreadcrumbItem = {
    label: string;
    href?: string;
};

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    // JSON-LD structured data for breadcrumbs
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://landforsaleinabuja.ng'
            },
            ...items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 2,
                name: item.label,
                ...(item.href ? { item: `https://landforsaleinabuja.ng${item.href}` } : {})
            }))
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav
                aria-label="Breadcrumb"
                className={`text-sm text-gray-500 ${className}`}
            >
                <ol className="flex items-center flex-wrap gap-1">
                    <li className="flex items-center">
                        <Link
                            href="/"
                            className="hover:text-primary flex items-center"
                            aria-label="Home"
                        >
                            <Home className="w-4 h-4" />
                        </Link>
                    </li>
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center">
                            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-primary"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-gray-900 font-medium" aria-current="page">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}

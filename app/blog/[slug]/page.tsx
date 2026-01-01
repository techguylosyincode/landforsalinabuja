import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type BlogPost = {
    id: string;
    title: string;
    content: string;
    slug: string;
    created_at: string;
    category: string;
    author_name: string;
    image_url?: string;
    excerpt?: string;
};

export const revalidate = 3600; // Revalidate every hour

async function fetchPost(slug: string): Promise<BlogPost | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) return null;
    return data as BlogPost;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post) return {};

    const image = post.image_url || 'https://landforsaleinabuja.ng/logo.svg';

    return {
        title: `${post.title} | LandForSaleInAbuja.ng`,
        description: post.excerpt || post.content.substring(0, 160),
        alternates: {
            canonical: `https://landforsaleinabuja.ng/blog/${slug}`
        },
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 160),
            type: 'article',
            publishedTime: post.created_at,
            authors: [post.author_name || 'Admin'],
            images: [image],
            url: `https://landforsaleinabuja.ng/blog/${slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            site: '@landinabuja',
            creator: '@landinabuja',
            title: post.title,
            description: post.excerpt || post.content.substring(0, 160),
            images: [image],
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || post.content.substring(0, 160),
        image: post.image_url ? [post.image_url] : [],
        datePublished: post.created_at,
        dateModified: post.created_at,
        author: [{
            '@type': 'Person',
            name: post.author_name || 'Admin',
        }],
        publisher: {
            '@type': 'Organization',
            name: 'LandForSaleInAbuja.ng',
            logo: {
                '@type': 'ImageObject',
                url: 'https://landforsaleinabuja.ng/logo.svg'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://landforsaleinabuja.ng/blog/${post.slug}`
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-12 md:pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <header className="bg-primary text-white py-10 md:py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 md:mb-8 transition-colors text-sm md:text-base">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Guides
                    </Link>

                    <div className="max-w-4xl">
                        <div className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            {post.category || 'Guide'}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">{post.title}</h1>

                        <div className="flex flex-wrap items-center text-white/80 text-sm gap-4 md:gap-6">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {post.author_name || 'Admin'}
                            </div>
                            <div className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span>
                                8 min read
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-6xl -mt-6 md:-mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main Content */}
                    <article className="lg:col-span-8 bg-white rounded-xl shadow-sm p-6 md:p-12">
                        <nav className="flex text-sm text-gray-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li className="inline-flex items-center">
                                    <Link href="/" className="hover:text-primary">Home</Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <span className="mx-2">/</span>
                                        <Link href="/blog" className="hover:text-primary">Blog</Link>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div className="flex items-center">
                                        <span className="mx-2">/</span>
                                        <span className="text-gray-900 truncate max-w-[150px] md:max-w-[200px]">{post.title}</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>

                        {post.image_url && (
                            <div className="mb-8 md:mb-10 rounded-xl overflow-hidden shadow-md">
                                <img src={post.image_url} alt={post.title} className="w-full h-auto object-cover max-h-[300px] md:max-h-[500px]" />
                            </div>
                        )}

                        <div className="prose prose-base md:prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />

                        {/* Author Bio */}
                        <div className="mt-12 md:mt-16 pt-8 border-t bg-gray-50 rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                {(post.author_name || 'A').charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">About the Author</h3>
                                <p className="text-gray-600 mb-4 text-sm md:text-base">
                                    The editorial team at LandForSaleInAbuja.ng is dedicated to providing accurate, up-to-date information on the FCT real estate market. We help you navigate property verification and investment with confidence.
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/contact">Contact Us</Link>
                                </Button>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-6 md:space-y-8">
                        {/* CTA Card */}
                        <div className="bg-primary text-white rounded-xl p-6 md:p-8 shadow-lg sticky top-8">
                            <h3 className="text-xl font-bold mb-4">Looking for Verified Land?</h3>
                            <p className="text-white/90 mb-6 text-sm md:text-base">
                                Don't risk your capital. Browse our curated list of verified land for sale in Abuja's top districts.
                            </p>
                            <Button size="lg" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold" asChild>
                                <Link href="/buy">Browse Listings</Link>
                            </Button>
                            <p className="text-xs text-center mt-4 text-white/60">
                                100% Verified • No Agency Fees Hidden
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Popular Districts</h3>
                            <ul className="space-y-2">
                                {['Maitama', 'Asokoro', 'Guzape', 'Wuse II', 'Gwarinpa', 'Lugbe'].map((district) => (
                                    <li key={district}>
                                        <Link href={`/buy?district=${district}`} className="text-gray-600 hover:text-primary flex items-center justify-between group py-1">
                                            <span>{district}</span>
                                            <span className="text-gray-300 group-hover:text-primary">→</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

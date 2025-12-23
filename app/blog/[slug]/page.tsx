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

    return {
        title: `${post.title} | LandForSaleInAbuja.ng`,
        description: post.excerpt || post.content.substring(0, 160),
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 160),
            type: 'article',
            publishedTime: post.created_at,
            authors: [post.author_name || 'Admin'],
            images: post.image_url ? [post.image_url] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white py-12">
            <article className="container mx-auto px-4 max-w-3xl">
                <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-primary mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Guides
                </Link>

                <header className="mb-8">
                    <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                        {post.category || 'Guide'}
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
                    <div className="flex items-center text-gray-500 text-sm gap-4">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" /> {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" /> {post.author_name || 'Admin'}
                        </div>
                    </div>
                </header>

                {post.image_url && (
                    <div className="mb-8 rounded-xl overflow-hidden">
                        <img src={post.image_url} alt={post.title} className="w-full h-auto object-cover" />
                    </div>
                )}

                <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />

                <div className="mt-12 pt-8 border-t">
                    <h3 className="font-bold text-xl mb-4">Ready to buy verified land?</h3>
                    <Button size="lg" asChild>
                        <Link href="/buy">Browse Listings</Link>
                    </Button>
                </div>
            </article>
        </main>
    );
}

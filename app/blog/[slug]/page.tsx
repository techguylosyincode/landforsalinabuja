"use client"; // Make it a client component for simplicity in this demo

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type BlogPost = {
    id: string;
    title: string;
    content: string;
    slug: string;
    created_at: string;
    category: string;
    author_name: string;
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', params.slug)
                .single();

            if (data) {
                setPost(data);
            }
            setLoading(false);
        };

        fetchPost();
    }, [params.slug]);

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading article...</div>;

    if (!post) {
        return (
            <div className="min-h-screen pt-20 text-center">
                <h1 className="text-2xl font-bold">Article Not Found</h1>
                <Button className="mt-4" asChild><Link href="/blog">Back to Blog</Link></Button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white py-12">
            <article className="container mx-auto px-4 max-w-3xl">
                <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-primary mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Guides
                </Link>

                <header className="mb-8">
                    <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                        {post.category}
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

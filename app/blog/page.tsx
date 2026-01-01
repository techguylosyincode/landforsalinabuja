import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Abuja Land Authority | Guides & Market Insights",
    description: "Expert guides, market insights, and verification tips for land buyers and investors in Abuja. Learn about C of O, R of O, and avoiding scams.",
    alternates: {
        canonical: 'https://landforsaleinabuja.ng/blog'
    },
    twitter: {
        card: 'summary',
        site: '@landinabuja',
        title: "Abuja Land Authority | Expert Guides",
        description: "Market insights and verification tips for land buyers in Abuja.",
        images: ['https://landforsaleinabuja.ng/logo.svg'],
    }
};

export const revalidate = 3600;

async function fetchPosts() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
    return data || [];
}

export default async function BlogPage() {
    const posts = await fetchPosts();

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold mb-4">Abuja Land Authority</h1>
                    <p className="text-gray-600 text-lg">
                        Expert guides, market insights, and verification tips for land buyers and investors.
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No articles published yet. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
                                <div className="h-48 bg-gray-200 w-full relative">
                                    {/* Placeholder or real image */}
                                    {post.image_url ? (
                                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                                        {post.category || 'Article'}
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 hover:text-primary transition-colors">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h2>
                                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                                        {post.excerpt || post.content?.substring(0, 150) + '...'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        <Button variant="link" className="p-0 h-auto" asChild>
                                            <Link href={`/blog/${post.slug}`}>Read More</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

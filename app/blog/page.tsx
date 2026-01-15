import Link from "next/link";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { BookOpen, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";

type StartHereLink = {
    title: string;
    href: string;
    label: string;
    description: string;
};

type GuidePillar = {
    title: string;
    description: string;
    icon: LucideIcon;
};

const START_HERE: StartHereLink[] = [
    {
        title: "How to Verify Land Title in Abuja",
        href: "/blog/how-to-verify-land-title-in-abuja",
        label: "Verification",
        description: "Step-by-step AGIS checks, required documents, and red flags before you pay.",
    },
    {
        title: "C of O vs R of O Explained",
        href: "/blog/c-of-o-vs-r-of-o-abuja-explained",
        label: "Title Types",
        description: "Understand the differences, the risks, and which title to prioritize.",
    },
    {
        title: "Land Scams in Abuja: Protection Guide",
        href: "/blog/land-scams-in-abuja-protection-guide",
        label: "Scam Avoidance",
        description: "Common scam patterns, verification steps, and safer payment practices.",
    },
];

const GUIDE_PILLARS: GuidePillar[] = [
    {
        title: "Verification first",
        description: "Clear steps for confirming C of O or R of O and validating ownership before any transfer.",
        icon: ShieldCheck,
    },
    {
        title: "Market signals",
        description: "Pricing, appreciation, and district growth trends explained without the fluff.",
        icon: TrendingUp,
    },
    {
        title: "Practical playbooks",
        description: "Checklists, timelines, and due diligence guides you can use immediately.",
        icon: BookOpen,
    },
];

export const metadata: Metadata = {
    title: "Abuja Land Authority | Guides & Market Insights",
    description: "Expert guides, market insights, and verification tips for land buyers and investors in Abuja. Learn about C of O, R of O, and avoiding scams.",
    alternates: {
        canonical: "https://landforsaleinabuja.ng/blog",
    },
    twitter: {
        card: "summary",
        site: "@landinabuja",
        title: "Abuja Land Authority | Expert Guides",
        description: "Market insights and verification tips for land buyers in Abuja.",
        images: ["https://landforsaleinabuja.ng/logo.svg"],
    },
};

export const revalidate = 3600;

async function fetchPosts() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

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
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[{ label: 'Guides & Blog', href: undefined }]}
                    className="mb-6"
                />

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold mb-4">Abuja Land Authority</h1>
                    <p className="text-gray-600 text-lg">
                        Expert guides, market insights, and verification tips for land buyers and investors.
                    </p>
                </div>

                <section className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 mb-12">
                    <div className="max-w-3xl mx-auto text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                            Start with the essentials
                        </h2>
                        <p className="text-gray-600">
                            Buying land in Abuja is document-heavy and time-sensitive. These guides focus on
                            verification, pricing signals, and safe transaction steps so you can move with clarity.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {START_HERE.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group block rounded-lg border border-gray-200 bg-white p-5 hover:border-primary/40 hover:shadow-sm transition"
                            >
                                <div className="text-xs font-bold uppercase tracking-wide text-primary mb-2">
                                    {item.label}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-8 border-t pt-6 text-sm text-gray-600 max-w-3xl mx-auto">
                        <p>
                            Each guide is written to answer the real questions buyers ask: what to verify, how to
                            interpret title documents, and where pricing gaps exist. We update content as market
                            conditions change and prioritize practical steps over theory.
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {GUIDE_PILLARS.map((pillar) => {
                        const Icon = pillar.icon;
                        return (
                            <div key={pillar.title} className="bg-white rounded-lg border border-gray-100 p-6">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{pillar.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{pillar.description}</p>
                            </div>
                        );
                    })}
                </section>

                {posts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No articles published yet. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border">
                                <div className="h-48 bg-gray-200 w-full relative">
                                    {post.image_url ? (
                                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                                        {post.category || "Article"}
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 hover:text-primary transition-colors">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h2>
                                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                                        {post.excerpt || post.content?.substring(0, 150) + "..."}
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

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, TrendingUp, AlertTriangle, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AreaGuidePage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();

    // 1. Fetch District Data
    // Note: In a real app, we'd query by slug, but for now we'll query by name (case-insensitive)
    // or just fetch all and find the match since the table is small.
    const { data: districts } = await supabase.from('districts').select('*');
    const district = districts?.find(d => d.name.toLowerCase() === params.slug.toLowerCase());

    if (!district) {
        return notFound();
    }

    // 2. Parse JSON Data
    const infrastructure = district.infrastructure_rating as any || {};
    const priceHistory = (district.avg_price_history as any[]) || [];
    const pros = (district.pros as string[]) || [];
    const cons = (district.cons as string[]) || [];

    // 3. Fetch latest published blog posts (exclude noindex)
    const { data: blogPosts } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, image_url, published_at, created_at")
        .or("status.eq.published,published.is.true")
        .eq("noindex", false)
        .order("published_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);

    // Calculate Growth (Mock logic if no history)
    const currentPrice = district.avg_price_per_sqm || 0;
    const lastYearPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price : currentPrice * 0.85;
    const growthRate = ((currentPrice - lastYearPrice) / lastYearPrice) * 100;

    return (
        <main className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <div className="relative h-[50vh] min-h-[400px] w-full">
                <Image
                    src={district.images?.[0] || "https://images.unsplash.com/photo-1599590984817-0c15f45b64a8?q=80&w=2073&auto=format&fit=crop"}
                    alt={district.name}
                    fill
                    className="object-cover brightness-50"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4">
                    <span className="bg-primary/90 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                        Investor Guide
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">{district.name}</h1>
                    <p className="text-xl md:text-2xl max-w-2xl font-light opacity-90">
                        {district.description?.slice(0, 100)}...
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* LEFT COLUMN: MAIN CONTENT */}
                <div className="lg:col-span-2 space-y-12">

                    {/* 1. THE VIBE */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <MapPin className="text-primary" /> The Vibe
                        </h2>
                        <div className="prose max-w-none text-gray-600 text-lg leading-relaxed">
                            {district.description || "No description available yet."}
                        </div>
                    </section>

                    {/* 2. INFRASTRUCTURE SCORECARD */}
                    <section className="bg-gray-50 rounded-2xl p-8 border">
                        <h2 className="text-2xl font-bold mb-6">Infrastructure Scorecard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ScoreCard
                                label="Road Network"
                                value={infrastructure.roads || "Unknown"}
                                icon="🛣️"
                                color={infrastructure.roads?.toLowerCase().includes('tarred') ? 'green' : 'yellow'}
                            />
                            <ScoreCard
                                label="Electricity"
                                value={infrastructure.electricity || "Unknown"}
                                icon="⚡"
                                color={infrastructure.electricity?.toLowerCase().includes('20') ? 'green' : 'orange'}
                            />
                            <ScoreCard
                                label="Water Supply"
                                value={infrastructure.water || "Unknown"}
                                icon="💧"
                                color={infrastructure.water?.toLowerCase().includes('board') ? 'green' : 'red'}
                            />
                        </div>
                    </section>

                    {/* 3. PROS & CONS */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                            <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" /> Why Invest Here
                            </h3>
                            <ul className="space-y-3">
                                {pros.length > 0 ? pros.map((pro, i) => (
                                    <li key={i} className="flex items-start gap-2 text-green-900 text-sm">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                        {pro}
                                    </li>
                                )) : <li className="text-gray-400 italic">No data added yet.</li>}
                            </ul>
                        </div>
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <h3 className="text-red-800 font-bold mb-4 flex items-center gap-2">
                                <XCircle className="h-5 w-5" /> Watch Out For
                            </h3>
                            <ul className="space-y-3">
                                {cons.length > 0 ? cons.map((con, i) => (
                                    <li key={i} className="flex items-start gap-2 text-red-900 text-sm">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                        {con}
                                    </li>
                                )) : <li className="text-gray-400 italic">No data added yet.</li>}
                            </ul>
                        </div>
                    </section>

                </div>

                {/* RIGHT COLUMN: INVESTMENT DATA */}
                <div className="space-y-8">

                    {/* PRICE CARD */}
                    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 sticky top-24">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 font-medium text-sm">Average Price</span>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> +{growthRate.toFixed(1)}% (YoY)
                            </span>
                        </div>
                        <div className="text-4xl font-bold text-gray-900 mb-1">
                            ₦{currentPrice.toLocaleString()}
                            <span className="text-lg text-gray-400 font-normal">/sqm</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-6">Based on verified listing data</p>

                        <div className="space-y-4 pt-6 border-t">
                            <div>
                                <span className="block text-sm font-medium text-gray-700 mb-1">Common Title Type</span>
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <BadgeCheck className="h-5 w-5 text-primary" />
                                    {district.title_type_common || "Varied"}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {district.title_type_common?.includes('C of O')
                                        ? "High Security. Safe for immediate development."
                                        : "Due diligence recommended."}
                                </p>
                            </div>
                        </div>

                        <Button className="w-full mt-8 h-12 text-lg" asChild>
                            <Link href={`/buy/${district.name.toLowerCase()}`}>
                                View Lands in {district.name}
                            </Link>
                        </Button>
                    </div>

                    {/* AGENT CTA */}
                    <div className="bg-blue-900 rounded-2xl p-8 text-white text-center">
                        <h3 className="font-bold text-xl mb-2">Are you an Agent?</h3>
                        <p className="text-blue-200 text-sm mb-6">Become a verified {district.name} specialist and get featured here.</p>
                        <Button variant="secondary" className="w-full">Get Verified</Button>
                    </div>

                    {/* RELATED BLOG POSTS */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Latest from the blog</h3>
                            <Link href="/blog" className="text-sm text-primary hover:underline">View all</Link>
                        </div>
                        <div className="space-y-4">
                            {blogPosts && blogPosts.length > 0 ? (
                                blogPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block rounded-lg border border-gray-100 hover:border-primary/30 hover:shadow-sm transition p-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs uppercase text-gray-400">Blog</p>
                                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary line-clamp-2">{post.title}</h4>
                                                {post.excerpt && (
                                                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{post.excerpt}</p>
                                                )}
                                            </div>
                                            {post.image_url && (
                                                <div className="h-14 w-14 relative rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                                                    <Image
                                                        src={post.image_url}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No blog posts yet.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

function ScoreCard({ label, value, icon, color }: { label: string, value: string, icon: string, color: 'green' | 'yellow' | 'orange' | 'red' }) {
    const colors = {
        green: "bg-green-100 text-green-800 border-green-200",
        yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
        orange: "bg-orange-100 text-orange-800 border-orange-200",
        red: "bg-red-100 text-red-800 border-red-200",
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[color]} flex flex-col items-center text-center`}>
            <span className="text-2xl mb-2">{icon}</span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</span>
            <span className="font-bold text-lg">{value}</span>
        </div>
    );
}

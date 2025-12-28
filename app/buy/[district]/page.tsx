import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, TrendingUp, ShieldCheck, MapPin, Info } from "lucide-react";

import { Metadata } from "next";
import { notFound } from "next/navigation";

// Define Property type matching PropertyCard props
type Property = {
    id: string;
    title: string;
    price: number;
    district: string;
    size: number;
    image: string;
    titleType: string;
    slug: string;
};

export const revalidate = 300;

// Generate static params for top districts to speed up loading
export async function generateStaticParams() {
    return [
        { district: 'scadens' },
    ];
}

export async function generateMetadata({ params }: { params: Promise<{ district: string }> }): Promise<Metadata> {
    const { district } = await params;
    const supabase = await createClient();

    const { data: content } = await supabase
        .select('*')
        .eq('slug', district.toLowerCase())
        .single();

    if (!content) {
        return {
            title: `Land for Sale in ${district.charAt(0).toUpperCase() + district.slice(1)} Abuja`,
            description: `Find verified land for sale in ${district}, Abuja. Browse listings with C of O and R of O titles.`
        };
    }

    return {
        title: `Land for Sale in ${content.name.charAt(0).toUpperCase() + content.name.slice(1)} | Area Guide`, // Fallback title if not in DB, or use DB title if we added it. 
        // Wait, I didn't add a 'title' column in the migration, only 'name'. 
        // The static file had a 'title' field. 
        // The migration added: market_analysis, why_invest, infrastructure, faqs, slug.
        // It already had: name, description, image_url.
        // So I should construct the title dynamically or use the description.
        // Let's use a constructed title for now.
        description: content.description,
        openGraph: {
            title: `Land for Sale in ${content.name}`,
            description: content.description,
            images: [content.image_url],
        }
    };
}

export default async function DistrictPage({ params }: { params: Promise<{ district: string }> }) {
    const { district } = await params;
    const districtName = district.toLowerCase();

    const supabase = await createClient();

    // Fetch district rich content
    const { data: content } = await supabase
        .from('districts')
        .select('*')
        .eq('slug', districtName)
        .single();
    const { data } = await supabase
        .from('properties')
        .select('id, title, price, size_sqm, district, images, title_type, slug')
        .ilike('district', district) // Use original param for DB query to match case-insensitive
        .order('created_at', { ascending: false })
        .limit(24);

    const properties: Property[] = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        district: p.district,
        size: p.size_sqm || p.size,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        titleType: p.title_type,
        slug: p.slug || p.id
    }));

    // Capitalize district name for display
    const displayDistrict = district.charAt(0).toUpperCase() + district.slice(1);

    // JSON-LD Schema for FAQs
    const faqSchema = content && content.faqs ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": content.faqs.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}

            {/* Hero Section */}
            <div className="relative bg-primary text-white py-16 md:py-24 overflow-hidden">
                {content?.heroImage && (
                    <div className="absolute inset-0 z-0 opacity-20">
                        <img src={content.heroImage} alt={displayDistrict} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="container mx-auto px-4 relative z-10">
                    <Link href="/buy" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Listings
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        {content ? `Land for Sale in ${displayDistrict}` : `Land for Sale in ${displayDistrict}`}
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl">
                        {content ? content.description : `Browse verified listings in ${displayDistrict}, Abuja.`}
                    </p>

                    {/* Market Stats (Only if content exists) */}
                    {content && content.market_analysis && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                <div className="text-sm text-gray-300">Avg. Price</div>
                                <div className="text-xl font-bold">{content.market_analysis.averagePrice}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                <div className="text-sm text-gray-300">Appreciation</div>
                                <div className="text-xl font-bold text-green-400">{content.market_analysis.appreciationRate}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                <div className="text-sm text-gray-300">Rental Yield</div>
                                <div className="text-xl font-bold">{content.market_analysis.rentalYield}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                <div className="text-sm text-gray-300">Demand</div>
                                <div className="text-xl font-bold text-secondary">{content.market_analysis.demandLevel}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                {/* Listings Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Available Listings</h2>
                        <span className="text-gray-500 text-sm">{properties.length} properties found</span>
                    </div>

                    {properties.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                            <h3 className="text-lg font-medium text-gray-900">No listings found in {displayDistrict}</h3>
                            <p className="text-gray-500 mt-2">We currently don't have any properties listed here. Check back soon!</p>
                            <Button className="mt-4" asChild>
                                <Link href="/buy">View All Areas</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Rich Content Section (SEO Gold) */}
                {content && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <section className="bg-white rounded-xl shadow-sm p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <TrendingUp className="w-6 h-6 text-primary mr-2" />
                                    Why Invest in {displayDistrict}?
                                </h2>
                                <ul className="space-y-4">
                                    {content.why_invest && content.why_invest.map((reason: string, index: number) => (
                                        <li key={index} className="flex items-start">
                                            <ShieldCheck className="w-5 h-5 text-secondary mt-1 mr-3 shrink-0" />
                                            <span dangerouslySetInnerHTML={{
                                                __html: reason.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                                            }} className="text-gray-600" />
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="bg-white rounded-xl shadow-sm p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <Info className="w-6 h-6 text-primary mr-2" />
                                    Frequently Asked Questions
                                </h2>
                                <div className="space-y-6">
                                    {content.faqs && content.faqs.map((faq: any, index: number) => (
                                        <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
                                            <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <section className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 text-primary mr-2" />
                                    Infrastructure & Amenities
                                </h3>
                                <ul className="space-y-3">
                                    {content.infrastructure && content.infrastructure.map((item: string, index: number) => (
                                        <li key={index} className="text-gray-600 text-sm flex items-center">
                                            <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="bg-primary text-white rounded-xl p-6 shadow-lg">
                                <h3 className="font-bold text-lg mb-2">Need Help Buying?</h3>
                                <p className="text-white/80 text-sm mb-6">
                                    Our agents specialize in {displayDistrict}. Get a free consultation today.
                                </p>
                                <Button variant="secondary" className="w-full font-bold" asChild>
                                    <Link href="/contact">Contact an Agent</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

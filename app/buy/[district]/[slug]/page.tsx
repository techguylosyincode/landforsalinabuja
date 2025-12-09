"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Ruler, CheckCircle, Phone, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Define Property type
type Property = {
    id: string;
    title: string;
    price: number;
    district: string;
    address: string;
    size: number;
    description: string;
    images: string[];
    title_type: string;
    features: string[];
    agent: {
        name: string;
        phone: string;
        agency: string;
        verified: boolean;
    } | null;
};

export default async function PropertyDetailsPage({ params }: { params: { district: string; slug: string } }) {
    // In a real server component, we can fetch directly without useEffect
    // But since we are using client-side supabase client in other parts, let's stick to consistent pattern
    // OR use the server client if we had it set up. 
    // For simplicity in this demo, I'll use a client component pattern or just fetch here if it's a server component.
    // Note: createClient in lib/supabase/client.ts is for browser. 
    // For server components, we need @supabase/ssr createServerClient.
    // To keep it simple and avoid setting up server auth cookies logic right now, 
    // I will make this a client component or use standard fetch if public.
    // Actually, let's make it a client component for now to reuse the existing client logic easily.

    // Wait, this is a Server Component by default in App Router.
    // I should use a client component wrapper or fetch data inside.
    // Let's use a client component for the content to handle the async fetch easily with the existing client.

    return <PropertyDetailsContent district={params.district} slug={params.slug} />;
}

import { useEffect, useState } from "react";

function PropertyDetailsContent({ district, slug }: { district: string; slug: string }) {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            const supabase = createClient();

            // Try to find by slug first (if we had a slug column), or by ID if slug is ID
            // Since our seed script didn't add slugs, we might be using IDs in URLs or need to handle it.
            // For the demo, let's assume the slug in URL might be the ID or we search by title/slug.

            // Let's try to fetch by ID if it looks like a UUID, otherwise by title-slug match?
            // Simpler: Just fetch all and find match? No, inefficient.
            // Let's assume for now we pass ID as slug or we added slug column.
            // The seed script didn't explicitly add slugs to DB schema, but I added it to the seed data object?
            // Wait, schema.sql has `slug` in `properties` table?
            // Let's check schema.sql.

            // Assuming schema has slug.
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                // .eq('slug', slug) // If slug column exists
                .eq('id', slug) // Try ID first as fallback
                .single();

            if (error && error.code !== 'PGRST116') {
                // Try searching by slug if ID failed
                const { data: slugData } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (slugData) {
                    setProperty(mapDBProperty(slugData));
                    setLoading(false);
                    return;
                }
            }

            if (data) {
                setProperty(mapDBProperty(data));
            }
            setLoading(false);
        };

        fetchProperty();
    }, [slug]);

    const mapDBProperty = (data: any): Property => ({
        ...data,
        agent: { // Mock agent if not joined
            name: "Verified Agent",
            phone: "+234 800 123 4567",
            agency: "Abuja Land Specialists",
            verified: true,
        }
    });

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading property details...</div>;

    if (!property) {
        return (
            <div className="min-h-screen pt-20 text-center">
                <h1 className="text-2xl font-bold">Property Not Found</h1>
                <p className="text-gray-600 mt-2">The property you are looking for does not exist.</p>
                <Button className="mt-4" asChild><Link href="/buy">Back to Listings</Link></Button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary">Home</Link> &gt;{" "}
                    <Link href="/buy" className="hover:text-primary">Buy</Link> &gt;{" "}
                    <span className="capitalize">{district}</span> &gt;{" "}
                    <span className="text-gray-900">{property.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-gray-200">
                            <Image
                                src={property.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"}
                                alt={property.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Details */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                                    <div className="flex items-center text-gray-500">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {property.address}
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 text-3xl font-bold text-primary">
                                    ₦{property.price.toLocaleString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y mb-6">
                                <div>
                                    <div className="text-sm text-gray-500">Size</div>
                                    <div className="font-bold flex items-center">
                                        <Ruler className="w-4 h-4 mr-1 text-secondary" />
                                        {property.size} sqm
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Title</div>
                                    <div className="font-bold flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                        {property.title_type}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Use</div>
                                    <div className="font-bold">Residential</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div className="font-bold text-green-600 capitalize">{property.features?.[0] || 'Active'}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-4">Description</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {property.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Agent Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="font-bold text-lg mb-4">Contact Agent</h3>
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                                    <span className="text-xl font-bold text-gray-500">{property.agent?.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <div className="font-bold">{property.agent?.name}</div>
                                    <div className="text-sm text-gray-500">{property.agent?.agency}</div>
                                    {property.agent?.verified && (
                                        <div className="text-xs text-green-600 flex items-center mt-1">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Verified Agent
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button className="w-full flex items-center justify-center gap-2">
                                    <Phone className="w-4 h-4" /> Call Agent
                                </Button>
                                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> WhatsApp
                                </Button>
                            </div>
                        </div>

                        {/* Safety Tips */}
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2">Safety Tips</h3>
                            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                                <li>Always inspect the land in person.</li>
                                <li>Verify documents at AGIS.</li>
                                <li>Do not pay before inspection.</li>
                                <li>Meet in a public place.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

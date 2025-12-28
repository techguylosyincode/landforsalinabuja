import { createClient } from "@/lib/supabase/server";
import BuyPageClient from "../BuyPageClient";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Commercial Land for Sale in Abuja | Hotels, Plazas & Industrial",
    description: "Find prime commercial land for sale in Abuja. Verified plots for hotels in Guzape, shopping plazas in Lugbe, and factories in Idu Industrial.",
};

export default async function CommercialBuyPage() {
    const supabase = await createClient();

    // Fetch only commercial properties
    const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, district, size_sqm, images, title_type, slug, is_featured, status')
        .eq('status', 'active')
        .eq('type', 'commercial')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching commercial properties:", error);
    }

    const properties = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        district: p.district,
        size: p.size_sqm,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
        titleType: p.title_type,
        slug: p.slug || p.id
    }));

    return (
        <main>
            {/* SEO Header Section */}
            <div className="bg-primary text-white py-12 md:py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">Commercial Land for Sale in Abuja</h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-8">
                        Secure the perfect location for your business. From industrial plots in Idu to luxury hotel sites in Guzape.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="secondary" asChild>
                            <Link href="/blog/abuja-commercial-land-investment-guide-2026">Read Investment Guide</Link>
                        </Button>
                        <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary" asChild>
                            <Link href="#listings">View Listings</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Benefits */}
            <div className="bg-gray-50 py-12 border-b">
                <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 bg-white rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg mb-2">High Rental Yields</h3>
                        <p className="text-gray-600">Plazas in Lugbe and Gwarinpa offer 10-15% annual rental returns.</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg mb-2">Industrial Hubs</h3>
                        <p className="text-gray-600">Idu Industrial Layout offers infrastructure ready for heavy manufacturing.</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg mb-2">Verified Titles</h3>
                        <p className="text-gray-600">All listed commercial plots come with C of O or R of O verification.</p>
                    </div>
                </div>
            </div>

            {/* Listings Section */}
            <div id="listings">
                <BuyPageClient
                    initialProperties={properties}
                    initialSearchTerm=""
                    initialDistrict=""
                    initialTitleType=""
                    initialPriceRange=""
                    initialMinPrice=""
                    initialMaxPrice=""
                    initialMinSize=""
                    initialMaxSize=""
                />
            </div>
        </main>
    );
}

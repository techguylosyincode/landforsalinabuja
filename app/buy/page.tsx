"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PropertyCard from "@/components/PropertyCard";
import { Search, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

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

export default function BuyPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            const supabase = createClient();

            let query = supabase.from('properties').select('*')
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false });

            if (searchTerm) {
                query = query.ilike('district', `%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (data) {
                const mappedProps: Property[] = data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    district: p.district,
                    size: p.size,
                    image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
                    titleType: p.title_type,
                    slug: p.slug || p.id
                }));
                setProperties(mappedProps);
            }
            setLoading(false);
        };

        // Debounce search could be added here, for now just fetch on mount
        fetchProperties();
    }, [searchTerm]); // Re-fetch when search term changes (simple implementation)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Trigger fetch via dependency array
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">Land for Sale in Abuja</h1>

                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by district..."
                                className="pl-9 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading properties...</div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No properties found matching your criteria.
                    </div>
                )}
            </div>
        </main>
    );
}

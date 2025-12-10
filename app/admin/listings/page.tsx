"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Star, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

type Property = {
    id: string;
    title: string;
    district: string;
    price: number;
    status: string;
    is_featured: boolean;
    created_at: string;
    slug: string;
};

export default function ManageListings() {
    const [listings, setListings] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchListings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setListings(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const toggleFeatured = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('properties')
            .update({ is_featured: !currentStatus })
            .eq('id', id);

        if (!error) {
            setListings(listings.map(l => l.id === id ? { ...l, is_featured: !currentStatus } : l));
        }
    };

    const deleteListing = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;

        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

        if (!error) {
            setListings(listings.filter(l => l.id !== id));
        }
    };

    if (loading) return <div>Loading listings...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Listings</h1>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Property</th>
                            <th className="p-4 font-medium text-gray-500">District</th>
                            <th className="p-4 font-medium text-gray-500">Price</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-gray-500">Featured</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {listings.map((listing) => (
                            <tr key={listing.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium max-w-xs truncate" title={listing.title}>
                                    {listing.title}
                                </td>
                                <td className="p-4">{listing.district}</td>
                                <td className="p-4">₦{listing.price.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {listing.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleFeatured(listing.id, listing.is_featured)}
                                        className={`p-1 rounded-full transition-colors ${listing.is_featured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-gray-400'}`}
                                    >
                                        <Star className="w-5 h-5" fill={listing.is_featured ? "currentColor" : "none"} />
                                    </button>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <Button size="sm" variant="outline" asChild className="h-8 w-8 p-0">
                                        <Link href={`/buy/${listing.district}/${listing.slug}`} target="_blank">
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => deleteListing(listing.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {listings.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No listings found.</div>
                )}
            </div>
        </div>
    );
}

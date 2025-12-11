"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart3, List, Trash2, Edit, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const BoostButton = dynamic(() => import("@/components/BoostButton"), { ssr: false });

type Property = {
    id: string;
    title: string;
    price: number;
    district: string;
    status: string;
    created_at: string;
    is_featured?: boolean;
    featured_until?: string;
};

export default function AgentDashboard() {
    const [listings, setListings] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            console.log("Dashboard: Starting fetch...");
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                console.log("Dashboard: User found:", user?.id);

                if (!user) {
                    console.log("Dashboard: No user, redirecting...");
                    router.push('/login');
                    return;
                }

                if (isMounted) setUser(user);

                const { data, error } = await supabase
                    .from('properties')
                    .select('id, title, price, district, status, created_at, is_featured, featured_until')
                    .eq('agent_id', user.id)
                    .order('created_at', { ascending: false });

                console.log("Dashboard: Properties fetched:", data?.length);

                if (error) throw error;

                if (isMounted && data) {
                    setListings(data);
                }
            } catch (e) {
                console.error("Error loading dashboard:", e);
            } finally {
                console.log("Dashboard: Finally block reached");
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        // Failsafe: Force stop loading after 5 seconds
        const timer = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("Dashboard: Force stopping loading after timeout");
                setLoading(false);
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [router]);

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading dashboard...</div>;

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
                        <p className="text-gray-600">Welcome back! Manage your listings and view performance.</p>
                    </div>
                    <Button className="flex items-center gap-2" asChild>
                        <Link href="/agent/dashboard/new">
                            <PlusCircle className="h-4 w-4" /> Add New Listing
                        </Link>
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-500">Active Listings</h3>
                            <List className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-3xl font-bold">{listings.length}</div>
                        <p className="text-xs text-green-600 mt-1">Total properties posted</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-500">Total Views</h3>
                            <BarChart3 className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="text-3xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">Analytics coming soon</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-500">Leads Generated</h3>
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">Check your email for leads</p>
                    </div>
                </div>

                {/* Recent Listings Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="font-bold text-lg">Your Listings</h3>
                    </div>

                    {listings.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 py-12">
                            <p>You have no active listings yet.</p>
                            <Button variant="link" className="mt-2" asChild>
                                <Link href="/agent/dashboard/new">Create your first listing</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-4 font-medium">Property</th>
                                        <th className="p-4 font-medium">Price</th>
                                        <th className="p-4 font-medium">District</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {listings.map((listing) => {
                                        const isFeaturedActive = listing.is_featured && listing.featured_until && new Date(listing.featured_until) > new Date();
                                        return (
                                            <tr key={listing.id} className="hover:bg-gray-50">
                                                <td className="p-4">
                                                    <div className="font-medium">{listing.title}</div>
                                                    {isFeaturedActive && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 mt-1">
                                                            <Zap className="h-3 w-3" /> Featured
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">₦{listing.price.toLocaleString()}</td>
                                                <td className="p-4">{listing.district}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {listing.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                                                            <Link href={`/agent/dashboard/edit/${listing.id}`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {!isFeaturedActive && user?.email && (
                                                            <BoostButton
                                                                propertyId={listing.id}
                                                                propertyTitle={listing.title}
                                                                userEmail={user.email}
                                                                onSuccess={() => {
                                                                    // Refresh listings
                                                                    setListings(prev => prev.map(l =>
                                                                        l.id === listing.id
                                                                            ? { ...l, is_featured: true, featured_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() }
                                                                            : l
                                                                    ));
                                                                }}
                                                            />
                                                        )}
                                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

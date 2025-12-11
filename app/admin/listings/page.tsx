import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Eye, Star, Trash2, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function ManageListings() {
    const supabase = await createClient();

    // Fetch Pending Listings
    const { data: pendingListings } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    // Fetch Active/Sold Listings
    const { data: otherListings } = await supabase
        .from('properties')
        .select('*')
        .neq('status', 'pending')
        .order('created_at', { ascending: false });

    async function toggleFeatured(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const id = formData.get("id") as string;
        const currentStatus = formData.get("currentStatus") === "true";

        await supabase.from('properties').update({ is_featured: !currentStatus }).eq('id', id);
        revalidatePath("/admin/listings");
    }

    async function toggleStatus(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const id = formData.get("id") as string;
        const currentStatus = formData.get("currentStatus") as string;
        const newStatus = currentStatus === 'active' ? 'pending' : 'active';

        await supabase.from('properties').update({ status: newStatus }).eq('id', id);
        revalidatePath("/admin/listings");
    }

    async function deleteListing(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const id = formData.get("id") as string;

        await supabase.from('properties').delete().eq('id', id);
        revalidatePath("/admin/listings");
    }

    const ListingTable = ({ listings, title, emptyMsg }: { listings: any[], title: string, emptyMsg: string }) => (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{title} <span className="text-sm font-normal text-gray-500">({listings?.length || 0})</span></h2>
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
                        {listings?.map((listing) => (
                            <tr key={listing.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium max-w-xs truncate" title={listing.title}>
                                    {listing.title}
                                </td>
                                <td className="p-4">{listing.district}</td>
                                <td className="p-4">₦{listing.price.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${listing.status === 'active' ? 'bg-green-100 text-green-700' : listing.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {listing.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <form action={toggleFeatured}>
                                        <input type="hidden" name="id" value={listing.id} />
                                        <input type="hidden" name="currentStatus" value={String(listing.is_featured)} />
                                        <button
                                            type="submit"
                                            className={`p-1 rounded-full transition-colors ${listing.is_featured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-gray-400'}`}
                                        >
                                            <Star className="w-5 h-5" fill={listing.is_featured ? "currentColor" : "none"} />
                                        </button>
                                    </form>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <form action={toggleStatus}>
                                        <input type="hidden" name="id" value={listing.id} />
                                        <input type="hidden" name="currentStatus" value={listing.status} />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className={`h-8 w-8 p-0 ${listing.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                            title={listing.status === 'active' ? "Deactivate" : "Approve"}
                                        >
                                            {listing.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                        </Button>
                                    </form>

                                    <Button size="sm" variant="outline" asChild className="h-8 w-8 p-0">
                                        <Link href={`/buy/${listing.district}/${listing.slug}`} target="_blank">
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    </Button>

                                    <form action={deleteListing}>
                                        <input type="hidden" name="id" value={listing.id} />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            type="submit"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!listings || listings.length === 0) && (
                    <div className="p-8 text-center text-gray-500">{emptyMsg}</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Listings</h1>
            </div>

            {/* Pending Listings Section */}
            <ListingTable
                listings={pendingListings || []}
                title="⚠️ Pending Approval"
                emptyMsg="No pending listings. Good job!"
            />

            {/* Active/Other Listings Section */}
            <ListingTable
                listings={otherListings || []}
                title="Active & Sold Listings"
                emptyMsg="No active listings found."
            />
        </div>
    );
}

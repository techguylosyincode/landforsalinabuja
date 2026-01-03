"use client";

import { Button } from "@/components/ui/button";
import { Star, Trash2, ExternalLink, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Listing {
    id: string;
    title: string;
    district: string;
    price: number;
    status: string;
    is_featured: boolean;
    slug: string;
    created_at: string;
    user_id: string;
    user?: {
        display_name?: string;
        company_name?: string;
    };
}

interface AdminListingsClientProps {
    pendingListings: Listing[];
    approvedListings: Listing[];
    pendingCount: number;
    approvedCount: number;
    currentPage: number;
    itemsPerPage: number;
    currentTab: string;
    toggleFeatured: (formData: FormData) => Promise<void>;
    toggleStatus: (formData: FormData) => Promise<void>;
    deleteListing: (formData: FormData) => Promise<void>;
}

export default function AdminListingsClient({
    pendingListings,
    approvedListings,
    pendingCount,
    approvedCount,
    currentPage,
    itemsPerPage,
    currentTab,
    toggleFeatured,
    toggleStatus,
    deleteListing,
}: AdminListingsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const listings = currentTab === 'pending' ? pendingListings : approvedListings;
    const totalCount = currentTab === 'pending' ? pendingCount : approvedCount;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        params.set('page', '1'); // Reset to page 1 when changing tabs
        router.push(`/admin/listings?${params.toString()}`);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const params = new URLSearchParams(searchParams);
            params.set('page', String(currentPage - 1));
            router.push(`/admin/listings?${params.toString()}`);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const params = new URLSearchParams(searchParams);
            params.set('page', String(currentPage + 1));
            router.push(`/admin/listings?${params.toString()}`);
        }
    };

    const getAgentName = (listing: Listing) => {
        if (!listing.user) return 'Unknown Agent';
        return listing.user.company_name || listing.user.display_name || 'Unknown Agent';
    };

    const ListingTable = ({ listings, title, emptyMsg }: { listings: Listing[]; title: string; emptyMsg: string }) => (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Property</th>
                            <th className="p-4 font-medium text-gray-500">Agent/Company</th>
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
                                <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                                    {getAgentName(listing)}
                                </td>
                                <td className="p-4">{listing.district}</td>
                                <td className="p-4">₦{listing.price.toLocaleString()}</td>
                                <td className="p-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            listing.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : listing.status === 'pending'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {listing.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <form action={toggleFeatured}>
                                        <input type="hidden" name="id" value={listing.id} />
                                        <input type="hidden" name="currentStatus" value={String(listing.is_featured)} />
                                        <button
                                            type="submit"
                                            className={`p-1 rounded-full transition-colors ${
                                                listing.is_featured
                                                    ? 'text-yellow-500 bg-yellow-50'
                                                    : 'text-gray-300 hover:text-gray-400'
                                            }`}
                                        >
                                            <Star className="w-5 h-5" fill={listing.is_featured ? 'currentColor' : 'none'} />
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
                                            className={`h-8 w-8 p-0 ${
                                                listing.status === 'active'
                                                    ? 'text-red-500 hover:bg-red-50'
                                                    : 'text-green-500 hover:bg-green-50'
                                            }`}
                                            title={listing.status === 'active' ? 'Deactivate' : 'Approve'}
                                        >
                                            {listing.status === 'active' ? (
                                                <XCircle className="h-4 w-4" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4" />
                                            )}
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Listings</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => handleTabChange('pending')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        currentTab === 'pending'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    ⚠️ Pending Approval
                    <span className="ml-2 text-sm font-normal text-gray-500">({pendingCount})</span>
                </button>
                <button
                    onClick={() => handleTabChange('approved')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        currentTab === 'approved'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    ✓ Active & Approved
                    <span className="ml-2 text-sm font-normal text-gray-500">({approvedCount})</span>
                </button>
            </div>

            {/* Listings Table */}
            <ListingTable
                listings={listings || []}
                title={currentTab === 'pending' ? 'Pending Listings' : 'Active Listings'}
                emptyMsg={
                    currentTab === 'pending'
                        ? 'No pending listings. Good job!'
                        : 'No active listings found.'
                }
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} ({totalCount} total)
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

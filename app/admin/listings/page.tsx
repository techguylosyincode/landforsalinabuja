import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Eye, Star, Trash2, ExternalLink, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import AdminListingsClient from "./AdminListingsClient";

export default async function ManageListings({
    searchParams,
}: {
    searchParams: { tab?: string; page?: string };
}) {
    const supabase = await createClient();
    const tab = searchParams.tab || 'pending';
    const page = parseInt(searchParams.page || '1');
    const itemsPerPage = 20;
    const offset = (page - 1) * itemsPerPage;

    // Fetch Pending Listings with Agent Info
    const { data: pendingListings, count: pendingCount } = await supabase
        .from('properties')
        .select('id, title, district, price, status, is_featured, slug, created_at, user_id, user:profiles(display_name, company_name)', { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

    // Fetch Active/Approved Listings with Agent Info
    const { data: approvedListings, count: approvedCount } = await supabase
        .from('properties')
        .select('id, title, district, price, status, is_featured, slug, created_at, user_id, user:profiles(display_name, company_name)', { count: 'exact' })
        .neq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

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

    return (
        <AdminListingsClient
            pendingListings={(pendingListings as any) || []}
            approvedListings={(approvedListings as any) || []}
            pendingCount={pendingCount || 0}
            approvedCount={approvedCount || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
            currentTab={tab}
            toggleFeatured={toggleFeatured}
            toggleStatus={toggleStatus}
            deleteListing={deleteListing}
        />
    );
}

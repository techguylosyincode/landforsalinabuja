'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBuyerRequest(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const budget = formData.get("budget") as string;
    const location = formData.get("location") as string;
    const property_type = formData.get("property_type") as string;
    const description = formData.get("description") as string;

    // Basic validation
    if (!name || !email || !phone || !description) {
        return { error: "Please fill in all required fields." };
    }

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("buyer_requests").insert({
        user_id: user?.id || null,
        name,
        email,
        phone,
        budget: budget ? parseFloat(budget) : null,
        location,
        property_type,
        description,
        status: 'open'
    });

    if (error) {
        console.error("Error creating request:", error);
        return { error: "Failed to submit request. Please try again." };
    }

    revalidatePath("/agent/dashboard/requests");
    return { success: true };
}

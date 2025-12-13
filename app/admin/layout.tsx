import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile (if it exists) and derive admin status with multiple fallbacks
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, subscription_tier, is_verified")
        .eq("id", user.id)
        .maybeSingle();

    const defaultAdminEmails = ["airealentng@gmail.com"];
    const adminEmailList = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
        .concat(defaultAdminEmails);

    const metadataRole = (user.user_metadata?.role || (user.app_metadata as any)?.role) as string | undefined;
    const isAdminByMetadata = metadataRole?.toLowerCase?.() === "admin";
    const isEmailAdmin = user.email ? adminEmailList.includes(user.email.toLowerCase()) : false;
    const isProfileAdmin = profile?.role === "admin";

    const isAdmin = isProfileAdmin || isAdminByMetadata || isEmailAdmin;

    // If the user should be admin but the profile row is missing/wrong, fix it so the panel stays accessible.
    if (isAdmin && !isProfileAdmin) {
        await supabase.from("profiles").upsert({
            id: user.id,
            role: "admin",
            full_name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? "Admin",
            subscription_tier: profile?.subscription_tier ?? "agency",
            is_verified: profile?.is_verified ?? true,
        });
    }

    if (!isAdmin) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, CreditCard, LogOut, PlusCircle, List, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sidebarLinks = [
    { name: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
    { name: "My Listings", href: "/agent/dashboard", icon: List }, // Duplicate for now, can be separate later
    { name: "Profile", href: "/agent/dashboard/profile", icon: User },
    { name: "Subscription", href: "/pricing", icon: CreditCard },
];

export default function AgentSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Logout error:", error);
                setLoggingOut(false);
                return;
            }
            router.push("/login");
            router.refresh();
        } catch (err) {
            console.error("Logout failed:", err);
            setLoggingOut(false);
        }
    };

    return (
        <div className="w-64 bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-10">
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <span>LandForSale</span>
                    <span className="text-gray-900">InAbuja</span>
                </Link>
                <div className="mt-1 text-xs text-gray-500 uppercase tracking-wider font-semibold">Agent Panel</div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {link.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t space-y-4">
                <Button className="w-full gap-2" asChild>
                    <Link href="/agent/dashboard/new">
                        <PlusCircle className="h-4 w-4" /> Post New Property
                    </Link>
                </Button>

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loggingOut ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <LogOut className="h-5 w-5" />
                    )}
                    {loggingOut ? "Logging out..." : "Logout"}
                </button>
            </div>
        </div>
    );
}

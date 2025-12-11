"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MapPin, Layers, Users, List, LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Locations", href: "/admin/locations", icon: MapPin },
    { name: "Land Types", href: "/admin/types", icon: Layers },
    { name: "Agents", href: "/admin/agents", icon: Users },
    { name: "Listings", href: "/admin/listings", icon: List },
    { name: "Area Guides", href: "/admin/districts", icon: MapPin },
];

export default function AdminSidebar() {
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
        <aside className="w-64 bg-white shadow-md flex flex-col h-screen">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            </div>
            <nav className="p-4 space-y-2 flex-1">
                {adminLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-2 rounded text-sm font-medium transition-colors ${isActive
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 px-4 py-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="h-4 w-4" />
                    )}
                    {loggingOut ? "Logging out..." : "Logout"}
                </button>
            </div>
        </aside>
    );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, PlusCircle, User, ShieldCheck, LogOut, Loader2 } from "lucide-react";

const agentLinks = [
    { name: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
    { name: "Post Listing", href: "/agent/dashboard/new", icon: PlusCircle },
    { name: "Profile & Verification", href: "/agent/dashboard/profile", icon: ShieldCheck },
];

export default function AgentSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split("@")[0] || null;
                setDisplayName(name);
            }
        };
        fetchUser();
    }, [supabase]);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Logout error:", error);
                return;
            }
            router.push("/login");
            router.refresh();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-sm flex flex-col">
            <div className="p-6 border-b">
                <p className="text-xs uppercase tracking-wider text-gray-500">Agent Portal</p>
                <h2 className="text-xl font-bold text-gray-900">Land for Sale</h2>
                {displayName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{displayName}</span>
                    </div>
                )}
            </div>

            <nav className="p-4 space-y-1 flex-1">
                {agentLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-2 rounded text-sm font-medium transition-colors ${isActive
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
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

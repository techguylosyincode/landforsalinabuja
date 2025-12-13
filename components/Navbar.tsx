"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        const syncAdminState = async (sessionUser: User | null) => {
            if (!sessionUser) {
                setIsAdmin(false);
                return;
            }

            const rawRole = (sessionUser.user_metadata?.role || (sessionUser.app_metadata as any)?.role) as string | undefined;
            if (rawRole && rawRole.toLowerCase() === "admin") {
                setIsAdmin(true);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', sessionUser.id)
                .maybeSingle();

            setIsAdmin(profile?.role === 'admin');
        };

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            await syncAdminState(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            await syncAdminState(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-2xl text-primary">
                    LandForSale<span className="text-secondary">InAbuja</span>.ng
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/buy" className="text-sm font-medium hover:text-primary transition-colors">
                        Buy Land
                    </Link>
                    <Link href="/sell" className="text-sm font-medium hover:text-primary transition-colors">
                        Sell Land
                    </Link>
                    <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
                        Area Guides
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <Link href="/admin" className="text-sm font-bold text-red-600 hover:text-red-700 hidden sm:block">
                            Admin Panel
                        </Link>
                    )}
                    {user ? (
                        <Link href="/agent/dashboard" className="text-sm font-medium hover:text-primary hidden sm:block">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-primary hidden sm:block">
                            Log in
                        </Link>
                    )}
                    <Button asChild>
                        <Link href={user ? "/agent/dashboard/new" : "/register"}>
                            Post a Property
                        </Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}

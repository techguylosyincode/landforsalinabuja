"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Users, Building2, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalAgents: 0,
        totalListings: 0,
        pendingAgents: 0,
        activeListings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient();

            // Fetch Agents Stats
            const { count: totalAgents } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'agent');

            const { count: pendingAgents } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'agent')
                .eq('is_verified', false);

            // Fetch Listings Stats
            const { count: totalListings } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true });

            const { count: activeListings } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            setStats({
                totalAgents: totalAgents || 0,
                pendingAgents: pendingAgents || 0,
                totalListings: totalListings || 0,
                activeListings: activeListings || 0
            });
            setLoading(false);
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Agents */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 font-medium">Total Agents</h3>
                        <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold">{stats.totalAgents}</div>
                    <p className="text-sm text-gray-500 mt-1">Registered on platform</p>
                </div>

                {/* Pending Verifications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 font-medium">Pending Verification</h3>
                        <AlertCircle className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="text-3xl font-bold">{stats.pendingAgents}</div>
                    <p className="text-sm text-gray-500 mt-1">Agents awaiting approval</p>
                </div>

                {/* Total Listings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 font-medium">Total Listings</h3>
                        <Building2 className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold">{stats.totalListings}</div>
                    <p className="text-sm text-gray-500 mt-1">All time properties</p>
                </div>

                {/* Active Listings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 font-medium">Active Listings</h3>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold">{stats.activeListings}</div>
                    <p className="text-sm text-gray-500 mt-1">Currently live on site</p>
                </div>
            </div>
        </div>
    );
}

'use client';

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, MapPin, Calendar, Phone, Mail, User } from "lucide-react";
import Link from "next/link";

type Request = {
    id: string;
    name: string;
    email: string;
    phone: string;
    budget: number;
    location: string;
    property_type: string;
    description: string;
    created_at: string;
};

export default function AgentRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchRequests() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('buyer_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setRequests(data);
            setLoading(false);
        }

        fetchRequests();
    }, []);

    const toggleUnlock = (id: string) => {
        const newSet = new Set(unlockedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setUnlockedIds(newSet);
    };

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Market Requests</h1>
                        <p className="text-gray-600">Real-time leads from buyers looking for property.</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/agent/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>

                {requests.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center border">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Yet</h3>
                        <p className="text-gray-500">Check back later for new leads.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">
                                            {req.property_type || "Property"}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                                        Looking for {req.property_type} in {req.location || "Abuja"}
                                    </h3>

                                    <div className="text-primary font-bold text-xl mb-4">
                                        Budget: ₦{req.budget ? req.budget.toLocaleString() : "Flexible"}
                                    </div>

                                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                                        "{req.description}"
                                    </p>

                                    <div className="space-y-3 border-t pt-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <User className="w-4 h-4 mr-2 text-gray-400" />
                                            {req.name}
                                        </div>

                                        {unlockedIds.has(req.id) ? (
                                            <div className="bg-green-50 p-3 rounded-lg space-y-2 animate-in fade-in">
                                                <div className="flex items-center text-sm font-medium text-gray-900">
                                                    <Phone className="w-4 h-4 mr-2 text-green-600" />
                                                    <a href={`tel:${req.phone}`} className="hover:underline">{req.phone}</a>
                                                </div>
                                                <div className="flex items-center text-sm font-medium text-gray-900">
                                                    <Mail className="w-4 h-4 mr-2 text-green-600" />
                                                    <a href={`mailto:${req.email}`} className="hover:underline">{req.email}</a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                <div className="flex justify-center gap-4 text-gray-400 mb-2">
                                                    <Phone className="w-5 h-5" />
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs text-gray-500">Contact info hidden</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t">
                                    <Button
                                        className={`w-full ${unlockedIds.has(req.id) ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}`}
                                        onClick={() => toggleUnlock(req.id)}
                                    >
                                        {unlockedIds.has(req.id) ? (
                                            <>
                                                <Unlock className="w-4 h-4 mr-2" /> Hide Contact
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4 mr-2" /> Unlock Contact
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

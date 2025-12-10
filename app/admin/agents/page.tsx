"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Shield } from "lucide-react";

type Agent = {
    id: string;
    full_name: string;
    email: string; // Note: Email might not be directly in profiles depending on schema, usually in auth.users. 
    // But for simplicity assuming we might have copied it or we fetch it. 
    // Actually, profiles usually has full_name, agency_name, phone_number.
    agency_name: string;
    phone_number: string;
    is_verified: boolean;
    created_at: string;
};

export default function ManageAgents() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const fetchAgents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'agent')
            .order('created_at', { ascending: false });

        if (data) {
            setAgents(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const toggleVerification = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_verified: !currentStatus })
            .eq('id', id);

        if (!error) {
            // Optimistic update
            setAgents(agents.map(a => a.id === id ? { ...a, is_verified: !currentStatus } : a));
        } else {
            alert("Failed to update verification status");
        }
    };

    if (loading) return <div>Loading agents...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Agents</h1>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Agent Name</th>
                            <th className="p-4 font-medium text-gray-500">Agency</th>
                            <th className="p-4 font-medium text-gray-500">Phone</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {agents.map((agent) => (
                            <tr key={agent.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{agent.full_name || "N/A"}</td>
                                <td className="p-4">{agent.agency_name || "N/A"}</td>
                                <td className="p-4">{agent.phone_number || "N/A"}</td>
                                <td className="p-4">
                                    {agent.is_verified ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Shield className="w-3 h-3 mr-1" /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={agent.is_verified ? "outline" : "default"}
                                        className={agent.is_verified ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "bg-green-600 hover:bg-green-700"}
                                        onClick={() => toggleVerification(agent.id, agent.is_verified)}
                                    >
                                        {agent.is_verified ? "Revoke" : "Verify"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {agents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No agents found.</div>
                )}
            </div>
        </div>
    );
}

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function ManageAgents() {
    const supabase = await createClient();
    const { data: agents } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin') // Exclude admins, show only agents/users
        .order('created_at', { ascending: false });

    async function toggleVerification(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const id = formData.get("id") as string;
        const currentStatus = formData.get("currentStatus") === "true";

        await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', id);
        revalidatePath("/admin/agents");
    }

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
                        {agents?.map((agent) => (
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
                                    <form action={toggleVerification}>
                                        <input type="hidden" name="id" value={agent.id} />
                                        <input type="hidden" name="currentStatus" value={String(agent.is_verified)} />
                                        <Button
                                            size="sm"
                                            variant={agent.is_verified ? "outline" : "default"}
                                            className={agent.is_verified ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "bg-green-600 hover:bg-green-700"}
                                            type="submit"
                                        >
                                            {agent.is_verified ? "Revoke" : "Verify"}
                                        </Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!agents || agents.length === 0) && (
                    <div className="p-8 text-center text-gray-500">No agents found.</div>
                )}
            </div>
        </div>
    );
}

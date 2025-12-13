import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Shield, FileText } from "lucide-react";
import { revalidatePath } from "next/cache";

type AgentProfile = {
    id: string;
    full_name: string | null;
    agency_name: string | null;
    phone_number: string | null;
    is_verified: boolean | null;
    verification_status?: string | null;
    verification_reason?: string | null;
    verification_submitted_at?: string | null;
    verified_at?: string | null;
    cac_number?: string | null;
    id_type?: string | null;
    id_number?: string | null;
    proof_files?: string[] | null;
};

export default async function ManageAgents() {
    const supabase = await createClient();
    const { data: { user: adminUser } = { user: null } } = await supabase.auth.getUser();
    const { data: agents } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin') // Exclude admins, show only agents/users
        .order('created_at', { ascending: false });

    const agentsWithProofUrls = agents ? await Promise.all(
        agents.map(async (agent: AgentProfile) => {
            const files = Array.isArray(agent.proof_files) ? agent.proof_files : [];
            const signedUrls: { name: string, url: string }[] = [];

            for (const path of files) {
                const { data: signed } = await supabase.storage
                    .from('agent-verifications')
                    .createSignedUrl(path, 60 * 30);

                if (signed?.signedUrl) {
                    signedUrls.push({ name: path.split("/").pop() || path, url: signed.signedUrl });
                }
            }

            return { ...agent, proofUrls: signedUrls };
        })
    ) : [];

    async function approveAgent(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const id = formData.get("id") as string;
        const { data: { user } = { user: null } } = await supabase.auth.getUser();

        await supabase.from('profiles').update({
            verification_status: 'verified',
            verification_reason: null,
            verified_at: new Date().toISOString(),
            verified_by: user?.id || null,
            is_verified: true,
        }).eq('id', id);

        revalidatePath("/admin/agents");
    }

    async function rejectAgent(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const id = formData.get("id") as string;
        const reason = ((formData.get("reason") as string) || "Verification rejected").trim();

        await supabase.from('profiles').update({
            verification_status: 'rejected',
            verification_reason: reason,
            is_verified: false,
        }).eq('id', id);

        revalidatePath("/admin/agents");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Agents</h1>
            <p className="text-sm text-gray-600">
                Only grant verification after confirming a valid CAC or government-issued ID has been submitted.
            </p>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Agent Name</th>
                            <th className="p-4 font-medium text-gray-500">Agency</th>
                            <th className="p-4 font-medium text-gray-500">Phone</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-gray-500">Docs</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {agentsWithProofUrls?.map((agent: AgentProfile & { proofUrls?: { name: string, url: string }[] }) => {
                            const status = agent.verification_status || (agent.is_verified ? "verified" : "unverified");
                            return (
                                <tr key={agent.id} className="hover:bg-gray-50 align-top">
                                    <td className="p-4 font-medium">{agent.full_name || "N/A"}</td>
                                    <td className="p-4">{agent.agency_name || "N/A"}</td>
                                    <td className="p-4">{agent.phone_number || "N/A"}</td>
                                    <td className="p-4">
                                        {status === "verified" ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <Shield className="w-3 h-3 mr-1" /> Verified
                                            </span>
                                        ) : status === "pending_review" ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Pending Review
                                            </span>
                                        ) : status === "rejected" ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Rejected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                Not Verified
                                            </span>
                                        )}
                                        {agent.cac_number && (
                                            <p className="text-xs text-gray-500 mt-1">CAC: {agent.cac_number}</p>
                                        )}
                                        {agent.id_type && agent.id_number && (
                                            <p className="text-xs text-gray-500">ID: {agent.id_type} / {agent.id_number}</p>
                                        )}
                                        {status === "rejected" && agent.verification_reason && (
                                            <p className="text-xs text-red-600 mt-1">Reason: {agent.verification_reason}</p>
                                        )}
                                    </td>
                                    <td className="p-4 space-y-1">
                                        {agent.proofUrls && agent.proofUrls.length > 0 ? (
                                            agent.proofUrls.map((file) => (
                                                <a
                                                    key={file.url}
                                                    href={file.url}
                                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <FileText className="w-3 h-3" /> {file.name}
                                                </a>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400">No files</span>
                                        )}
                                    </td>
                                    <td className="p-4 space-y-2">
                                        {status === "pending_review" ? (
                                            <>
                                                <form action={approveAgent}>
                                                    <input type="hidden" name="id" value={agent.id} />
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        type="submit"
                                                    >
                                                        Approve
                                                    </Button>
                                                </form>
                                                <form action={rejectAgent} className="space-y-1">
                                                    <input type="hidden" name="id" value={agent.id} />
                                                    <input
                                                        name="reason"
                                                        placeholder="Reason"
                                                        className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                                        type="submit"
                                                    >
                                                        Reject
                                                    </Button>
                                                </form>
                                            </>
                                        ) : status === "verified" ? (
                                            <form action={rejectAgent}>
                                                <input type="hidden" name="id" value={agent.id} />
                                                <input type="hidden" name="reason" value="Verification revoked" />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                                    type="submit"
                                                >
                                                    Revoke
                                                </Button>
                                            </form>
                                        ) : (
                                            <span className="text-xs text-gray-400 block">Awaiting submission</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {(!agentsWithProofUrls || agentsWithProofUrls.length === 0) && (
                    <div className="p-8 text-center text-gray-500">No agents found.</div>
                )}
            </div>
        </div>
    );
}

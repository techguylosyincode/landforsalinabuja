import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminAgentsTable from "@/components/AdminAgentsTable";

type AgentProfile = {
    id: string;
    full_name: string | null;
    agency_name: string | null;
    phone_number: string | null;
    role?: string | null;
    subscription_tier?: string | null;
    subscription_expiry?: string | null;
    is_verified: boolean | null;
    verification_status?: string | null;
    verification_reason?: string | null;
    verification_submitted_at?: string | null;
    verified_at?: string | null;
    cac_number?: string | null;
    id_type?: string | null;
    id_number?: string | null;
    proof_files?: string[] | null;
    email?: string | null;
};

export default async function ManageAgents() {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();
    const { data: { user: adminUser } = { user: null } } = await supabase.auth.getUser();
    const { data: agents } = await supabase
        .from('profiles')
        .select('id, full_name, agency_name, phone_number, role, subscription_tier, subscription_expiry, is_verified, verification_status, verification_reason, verification_submitted_at, verified_at, cac_number, id_type, id_number, proof_files')
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

            // Fetch email using admin client
            let email = null;
            try {
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(agent.id);
                email = userData?.user?.email || null;
            } catch (err) {
                console.error(`Failed to fetch email for agent ${agent.id}:`, err);
                email = null;
            }

            return { ...agent, proofUrls: signedUrls, email };
        })
    ) : [];


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Agents</h1>
            <p className="text-sm text-gray-600">
                Only grant verification after confirming a valid CAC or government-issued ID has been submitted.
            </p>

            <AdminAgentsTable
                agents={agentsWithProofUrls as AgentProfile[]}
            />
        </div>
    );
}

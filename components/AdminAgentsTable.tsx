'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, FileText } from 'lucide-react';

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
    proofUrls?: { name: string, url: string }[];
};

interface AdminAgentsTableProps {
    agents: AgentProfile[];
}

export default function AdminAgentsTable({ agents }: AdminAgentsTableProps) {
    const [editingAgent, setEditingAgent] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{
        tier: string;
        expiry: string;
    }>({ tier: '', expiry: '' });
    const [saving, setSaving] = useState(false);
    const [rejectingAgent, setRejectingAgent] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
    const [approvingAgent, setApprovingAgent] = useState<string | null>(null);
    const [operationError, setOperationError] = useState<string | null>(null);

    const handleEditClick = (agent: AgentProfile) => {
        setEditingAgent(agent.id);
        setEditValues({
            tier: agent.subscription_tier || 'starter',
            expiry: agent.subscription_expiry ? new Date(agent.subscription_expiry).toISOString().split('T')[0] : '',
        });
    };

    const handleCancelEdit = () => {
        setEditingAgent(null);
        setEditValues({ tier: '', expiry: '' });
    };

    const handleSaveSubscription = async (agentId: string) => {
        setSaving(true);
        try {
            const response = await fetch('/api/admin/update-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: agentId,
                    subscriptionTier: editValues.tier,
                    subscriptionExpiry: editValues.expiry ? new Date(editValues.expiry).toISOString() : null,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(`Error: ${result.error}`);
                return;
            }

            setEditingAgent(null);
            window.location.reload();
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to update subscription');
        } finally {
            setSaving(false);
        }
    };

    const handleApproveAgent = async (agentId: string) => {
        setApprovingAgent(agentId);
        setOperationError(null);
        try {
            const response = await fetch('/api/admin/approve-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId }),
            });

            const result = await response.json();

            if (!response.ok) {
                setOperationError(result.error || 'Failed to approve agent');
                return;
            }

            window.location.reload();
        } catch (err) {
            console.error('Approval error:', err);
            setOperationError('Failed to approve agent');
        } finally {
            setApprovingAgent(null);
        }
    };

    const handleRejectAgent = async (agentId: string, reason: string) => {
        setRejectingAgent(agentId);
        setOperationError(null);
        try {
            const response = await fetch('/api/admin/reject-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, reason: reason || 'Verification rejected' }),
            });

            const result = await response.json();

            if (!response.ok) {
                setOperationError(result.error || 'Failed to reject agent');
                return;
            }

            window.location.reload();
        } catch (err) {
            console.error('Rejection error:', err);
            setOperationError('Failed to reject agent');
        } finally {
            setRejectingAgent(null);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-medium text-gray-500">Agent Name</th>
                        <th className="p-4 font-medium text-gray-500">Email</th>
                        <th className="p-4 font-medium text-gray-500">Agency</th>
                        <th className="p-4 font-medium text-gray-500">Phone</th>
                        <th className="p-4 font-medium text-gray-500">Type / Plan</th>
                        <th className="p-4 font-medium text-gray-500">Expiry</th>
                        <th className="p-4 font-medium text-gray-500">Status</th>
                        <th className="p-4 font-medium text-gray-500">Docs</th>
                        <th className="p-4 font-medium text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {agents?.map((agent: AgentProfile) => {
                        const status = agent.verification_status || (agent.is_verified ? 'verified' : 'unverified');
                        const typeLabel = agent.role || 'unknown';
                        const tier = agent.subscription_tier || 'starter';
                        return (
                            <tr key={agent.id} className="hover:bg-gray-50 align-top">
                                <td className="p-4 font-medium">{agent.full_name || 'N/A'}</td>
                                <td className="p-4 text-sm text-gray-600">{agent.email || 'N/A'}</td>
                                <td className="p-4">{agent.agency_name || 'N/A'}</td>
                                <td className="p-4">{agent.phone_number || 'N/A'}</td>
                                <td className="p-4 space-y-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                        {typeLabel}
                                    </span>
                                    <span className="block text-xs text-gray-500 capitalize">
                                        {editingAgent === agent.id ? (
                                            <select
                                                value={editValues.tier}
                                                onChange={(e) => setEditValues(prev => ({ ...prev, tier: e.target.value }))}
                                                className="px-2 py-1 border rounded text-xs w-full"
                                            >
                                                <option value="starter">Starter</option>
                                                <option value="pro">Pro</option>
                                                <option value="premium">Premium</option>
                                                <option value="agency">Agency</option>
                                            </select>
                                        ) : (
                                            `Plan: ${tier}`
                                        )}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    {editingAgent === agent.id ? (
                                        <input
                                            type="date"
                                            value={editValues.expiry}
                                            onChange={(e) => setEditValues(prev => ({ ...prev, expiry: e.target.value }))}
                                            className="px-2 py-1 border rounded text-xs w-full"
                                        />
                                    ) : (
                                        agent.subscription_expiry
                                            ? new Date(agent.subscription_expiry).toLocaleDateString()
                                            : 'No expiry'
                                    )}
                                </td>
                                <td className="p-4">
                                    {status === 'verified' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Shield className="w-3 h-3 mr-1" /> Verified
                                        </span>
                                    ) : status === 'pending_review' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pending Review
                                        </span>
                                    ) : status === 'rejected' ? (
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
                                    {status === 'rejected' && agent.verification_reason && (
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
                                    {editingAgent === agent.id ? (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSaveSubscription(agent.id)}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditClick(agent)}
                                            >
                                                Edit Sub
                                            </Button>
                                            {status === 'pending_review' ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApproveAgent(agent.id)}
                                                        disabled={approvingAgent === agent.id}
                                                    >
                                                        {approvingAgent === agent.id ? 'Approving...' : 'Approve'}
                                                    </Button>
                                                    <div className="space-y-1">
                                                        <input
                                                            placeholder="Reason"
                                                            className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                                                            onChange={(e) => setRejectReason(prev => ({ ...prev, [agent.id]: e.target.value }))}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                                            onClick={() => handleRejectAgent(agent.id, rejectReason[agent.id] || '')}
                                                            disabled={rejectingAgent === agent.id}
                                                        >
                                                            {rejectingAgent === agent.id ? 'Rejecting...' : 'Reject'}
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : status === 'verified' ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                                    onClick={() => handleRejectAgent(agent.id, 'Verification revoked')}
                                                    disabled={rejectingAgent === agent.id}
                                                >
                                                    {rejectingAgent === agent.id ? 'Revoking...' : 'Revoke'}
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-gray-400 block">Awaiting submission</span>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {(!agents || agents.length === 0) && (
                <div className="p-8 text-center text-gray-500">No agents found.</div>
            )}
        </div>
    );
}

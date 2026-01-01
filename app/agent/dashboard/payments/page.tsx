"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter, Calendar, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

type Transaction = {
    id: string;
    reference: string;
    transaction_type: string;
    amount: number;
    status: string;
    created_at: string;
    verified_at?: string;
    subscription_tier?: string;
    billing_cycle?: string;
    boost_duration?: number;
};

type UserProfile = {
    subscription_tier?: string;
    subscription_expiry?: string | null;
};

export default function PaymentHistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'subscription' | 'boost'>('all');
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                if (isMounted) setUser(user);

                // Fetch user profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('subscription_tier, subscription_expiry')
                    .eq('id', user.id)
                    .maybeSingle();

                if (isMounted && profileData) {
                    setProfile(profileData);
                }

                // Fetch transactions
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (isMounted && data) {
                    setTransactions(data);
                    applyFilter(data, 'all');
                }
            } catch (error) {
                console.error("Error loading payment history:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const applyFilter = (txs: Transaction[], type: 'all' | 'subscription' | 'boost') => {
        if (type === 'all') {
            setFilteredTransactions(txs);
        } else {
            setFilteredTransactions(txs.filter(tx => tx.transaction_type === type));
        }
    };

    const handleFilter = (type: 'all' | 'subscription' | 'boost') => {
        setFilterType(type);
        applyFilter(transactions, type);
    };

    // Calculate summary stats
    const successfulTransactions = transactions.filter(tx => tx.status === 'success');
    const totalSpent = successfulTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const subscriptionCount = successfulTransactions.filter(tx => tx.transaction_type === 'subscription').length;
    const boostCount = successfulTransactions.filter(tx => tx.transaction_type === 'boost').length;

    const isSubscriptionActive = profile?.subscription_expiry && new Date(profile.subscription_expiry) > new Date();

    // Get status badge color
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'abandoned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4" />;
            case 'failed':
                return <XCircle className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            default:
                return null;
        }
    };

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading payment history...</div>;

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/agent/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Payment History</h1>
                        <p className="text-gray-600">View all your subscription and boost payments</p>
                    </div>
                </div>

                {/* Subscription Status Card */}
                {profile && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm text-gray-600 mb-2">Current Subscription</h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${isSubscriptionActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <p className="text-2xl font-bold">{profile.subscription_tier || 'Starter'}</p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {isSubscriptionActive ? (
                                        <>Renews: {new Date(profile.subscription_expiry!).toLocaleDateString()}</>
                                    ) : (
                                        <>No active subscription</>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center justify-end">
                                <Button asChild>
                                    <Link href="/pricing">Upgrade Plan</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                                <p className="text-3xl font-bold">₦{totalSpent.toLocaleString()}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-primary/20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Subscriptions</p>
                                <p className="text-3xl font-bold">{subscriptionCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-primary/20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Boosts</p>
                                <p className="text-3xl font-bold">{boostCount}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-primary/20" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filter by Type</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filterType === 'all' ? 'default' : 'outline'}
                            onClick={() => handleFilter('all')}
                        >
                            All Transactions
                        </Button>
                        <Button
                            variant={filterType === 'subscription' ? 'default' : 'outline'}
                            onClick={() => handleFilter('subscription')}
                        >
                            Subscriptions
                        </Button>
                        <Button
                            variant={filterType === 'boost' ? 'default' : 'outline'}
                            onClick={() => handleFilter('boost')}
                        >
                            Boosts
                        </Button>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center">
                            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No transactions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 font-medium text-gray-700">Date</th>
                                        <th className="p-4 font-medium text-gray-700">Reference</th>
                                        <th className="p-4 font-medium text-gray-700">Type</th>
                                        <th className="p-4 font-medium text-gray-700">Amount</th>
                                        <th className="p-4 font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                {new Date(tx.created_at).toLocaleDateString()} at{' '}
                                                {new Date(tx.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="p-4 font-mono text-xs text-gray-600 truncate max-w-xs" title={tx.reference}>
                                                {tx.reference}
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize">
                                                    {tx.transaction_type === 'subscription' ? (
                                                        <>
                                                            {tx.subscription_tier} - {tx.billing_cycle}
                                                        </>
                                                    ) : (
                                                        <>
                                                            Boost ({tx.boost_duration}d)
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4 font-semibold">
                                                ₦{tx.amount.toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                                                    {getStatusIcon(tx.status)}
                                                    <span className="capitalize">{tx.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                    <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                    <p className="text-sm text-blue-800">
                        If you have questions about your payments or billing, please contact our support team at{' '}
                        <a href="mailto:support@landforsaleinabuja.ng" className="font-semibold hover:underline">
                            support@landforsaleinabuja.ng
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}

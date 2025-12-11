"use client";

import { Button } from "@/components/ui/button";
import { Check, Shield, Zap, Building2, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import PaystackButton with SSR disabled
const PaystackButton = dynamic(() => import("@/components/PaystackButton"), {
    ssr: false,
    loading: () => <Button className="w-full" size="lg" disabled>Loading Payment...</Button>
});

// Replace with your actual Paystack Public Key
const PAYSTACK_PUBLIC_KEY = "pk_test_c9c03d9bc9dd6f9b43f70bbc9c1783e5ad72b730";

// Pricing configuration
const PRICING = {
    pro: {
        monthly: 10000,
        annual: 100000, // 2 months free (10k * 10)
        listingLimit: 5,
    },
    agency: {
        monthly: 25000,
        annual: 250000, // 2 months free (25k * 10)
        listingLimit: -1, // unlimited
    }
};

export default function PricingPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('subscription_tier, subscription_expiry')
                        .eq('id', user.id)
                        .single();
                    setProfile(data);
                }
            } catch (e) {
                console.error("Error checking auth status:", e);
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, []);

    const handleSuccess = async (reference: any, tier: string) => {
        const response = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reference: reference.reference,
                userId: user?.id,
                tier,
                billingCycle
            })
        });

        if (response.ok) {
            alert(`Payment successful! You are now a ${tier === 'pro' ? 'Pro' : 'Agency'} member.`);
            router.push('/agent/dashboard');
            router.refresh();
        } else {
            alert("Payment verification failed. Please contact support.");
        }
    };

    const handleClose = () => {
        console.log("Payment closed");
    };

    const getPrice = (tier: 'pro' | 'agency') => {
        return billingCycle === 'annual' ? PRICING[tier].annual : PRICING[tier].monthly;
    };

    const getSavings = (tier: 'pro' | 'agency') => {
        const monthlyTotal = PRICING[tier].monthly * 12;
        const annualPrice = PRICING[tier].annual;
        return monthlyTotal - annualPrice;
    };

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading plans...</div>;

    const currentTier = profile?.subscription_tier || 'starter';

    return (
        <main className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-gray-600">Choose the plan that helps you sell land faster in Abuja.</p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white rounded-full p-1 shadow-sm border inline-flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                billingCycle === 'monthly'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                billingCycle === 'annual'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Annual <span className="text-green-600 font-bold ml-1">Save 17%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter Plan */}
                    <div className={`bg-white rounded-2xl shadow-sm border p-8 flex flex-col ${currentTier === 'starter' ? 'ring-2 ring-primary' : ''}`}>
                        {currentTier === 'starter' && (
                            <div className="text-xs font-bold text-primary mb-4">CURRENT PLAN</div>
                        )}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-500 mb-2">Starter</h3>
                            <div className="text-4xl font-bold">Free</div>
                            <p className="text-gray-500 mt-2">Perfect for getting started.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span><strong>1</strong> Active Listing</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>Basic Search Visibility</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>Standard Support</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X className="h-5 w-5 flex-shrink-0" />
                                <span>Featured Listings</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X className="h-5 w-5 flex-shrink-0" />
                                <span>Verified Badge</span>
                            </li>
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full"
                            size="lg"
                            onClick={() => router.push(user ? '/agent/dashboard' : '/register')}
                        >
                            {user ? (currentTier === 'starter' ? 'Current Plan' : 'Downgrade') : 'Get Started'}
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className={`bg-white rounded-2xl shadow-lg border-2 border-primary p-8 flex flex-col relative overflow-hidden ${currentTier === 'pro' ? 'ring-2 ring-green-500' : ''}`}>
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            MOST POPULAR
                        </div>
                        {currentTier === 'pro' && (
                            <div className="text-xs font-bold text-green-600 mb-4">CURRENT PLAN</div>
                        )}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-primary mb-2">Pro Agent</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">₦{getPrice('pro').toLocaleString()}</span>
                                <span className="text-gray-500">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                            </div>
                            {billingCycle === 'annual' && (
                                <p className="text-green-600 text-sm mt-1">
                                    Save ₦{getSavings('pro').toLocaleString()}/year
                                </p>
                            )}
                            <p className="text-gray-500 mt-2">For serious agents.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                <span><strong>5</strong> Active Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                <span><strong>Featured</strong> Listings (Top of Search)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                                <span>"Verified Agent" Badge</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                <span>Priority Support</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X className="h-5 w-5 flex-shrink-0" />
                                <span>Team Members</span>
                            </li>
                        </ul>

                        {currentTier === 'pro' ? (
                            <Button variant="outline" className="w-full" size="lg" disabled>
                                Current Plan
                            </Button>
                        ) : (
                            <PaystackButton
                                amount={getPrice('pro')}
                                email={user?.email || ""}
                                publicKey={PAYSTACK_PUBLIC_KEY}
                                onSuccess={(ref) => handleSuccess(ref, 'pro')}
                                onClose={handleClose}
                                user={user}
                                label={currentTier === 'agency' ? 'Downgrade to Pro' : 'Upgrade to Pro'}
                            />
                        )}
                    </div>

                    {/* Agency Plan */}
                    <div className={`bg-white rounded-2xl shadow-sm border p-8 flex flex-col relative ${currentTier === 'agency' ? 'ring-2 ring-green-500' : ''}`}>
                        {currentTier === 'agency' && (
                            <div className="text-xs font-bold text-green-600 mb-4">CURRENT PLAN</div>
                        )}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Agency
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">₦{getPrice('agency').toLocaleString()}</span>
                                <span className="text-gray-500">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                            </div>
                            {billingCycle === 'annual' && (
                                <p className="text-green-600 text-sm mt-1">
                                    Save ₦{getSavings('agency').toLocaleString()}/year
                                </p>
                            )}
                            <p className="text-gray-500 mt-2">For agencies & developers.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span><strong>Unlimited</strong> Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                <span><strong>Featured</strong> Listings (Top of Search)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>"Verified Agency" Badge</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>Priority Support</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>Team Members (Coming Soon)</span>
                            </li>
                        </ul>

                        {currentTier === 'agency' ? (
                            <Button variant="outline" className="w-full" size="lg" disabled>
                                Current Plan
                            </Button>
                        ) : (
                            <PaystackButton
                                amount={getPrice('agency')}
                                email={user?.email || ""}
                                publicKey={PAYSTACK_PUBLIC_KEY}
                                onSuccess={(ref) => handleSuccess(ref, 'agency')}
                                onClose={handleClose}
                                user={user}
                                label="Upgrade to Agency"
                            />
                        )}
                    </div>
                </div>

                {/* FAQ or comparison */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600">
                        All plans include basic features. Upgrade anytime. Cancel anytime.
                    </p>
                </div>
            </div>
        </main>
    );
}

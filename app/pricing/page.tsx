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

// Get Paystack Public Key from environment variable
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

// Pricing configuration (Jan 2026)
// Competitive with PropertyPro: Manager ₦15.9k, Executive ₦27.9k, Platinum ₦169.9k
const PRICING = {
    pro: {
        monthly: 15000,          // ₦15,000/mo - matches market entry price
        annual: 150000,          // ₦150,000/yr - 2 months free
        listingLimit: 30,
    },
    business: {
        monthly: 35000,          // ₦35,000/mo - mid-tier for growing agents
        annual: 350000,          // ₦350,000/yr - 2 months free
        listingLimit: 100,
    },
    agency: {
        monthly: 75000,          // ₦75,000/mo - still 56% cheaper than PropertyPro Platinum
        annual: 750000,          // ₦750,000/yr - 2 months free
        listingLimit: -1,        // unlimited
    }
};

export default function PricingPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        const getUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user }, error } = await supabase.auth.getUser();
                if (!isMounted) return;
                if (error) {
                    console.error("Auth error on pricing page:", error);
                    setLoadError("We couldn't confirm your account right now, but you can still view plans.");
                }
                setUser(user);

                if (user) {
                    const { data, error: profileError } = await supabase
                        .from('profiles')
                        .select('subscription_tier, subscription_expiry')
                        .eq('id', user.id)
                        .single();
                    if (profileError) {
                        console.error("Profile fetch error on pricing:", profileError);
                        setLoadError("We couldn't load your current plan. Plans are still visible below.");
                    }
                    if (!isMounted) return;

                    // Fallback: if expired, treat as starter in UI
                    const expiry = data?.subscription_expiry ? new Date(data.subscription_expiry) : null;
                    if (expiry && expiry.getTime() < Date.now()) {
                        setProfile({ ...data, subscription_tier: 'starter' });
                    } else {
                        setProfile(data);
                    }
                }
            } catch (e) {
                console.error("Error checking auth status:", e);
                if (isMounted) setLoadError("We couldn't load your account. Plans are still visible.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        // Failsafe in case network hangs
        const timeout = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 5000);

        getUser();
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
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

    const getPrice = (tier: 'pro' | 'business' | 'agency') => {
        return billingCycle === 'annual' ? PRICING[tier].annual : PRICING[tier].monthly;
    };

    const getSavings = (tier: 'pro' | 'business' | 'agency') => {
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
                    {loadError && <p className="text-sm text-yellow-700 mt-2">{loadError}</p>}
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white rounded-full p-1 shadow-sm border inline-flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'monthly'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'annual'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Annual <span className="text-green-600 font-bold ml-1">Save 17%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {/* Starter Plan */}
                    <div className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col ${currentTier === 'starter' ? 'ring-2 ring-primary' : ''}`}>
                        {currentTier === 'starter' && (
                            <div className="text-xs font-bold text-primary mb-4">CURRENT PLAN</div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-500 mb-2">Starter</h3>
                            <div className="text-4xl font-bold">Free</div>
                            <p className="text-gray-500 mt-2 text-sm">Try the platform risk-free.</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1 text-sm">
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span><strong>1</strong> Active Listing</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>Basic Search Visibility</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>Standard Support</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X className="h-4 w-4 flex-shrink-0" />
                                <span>Featured Listings</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X className="h-4 w-4 flex-shrink-0" />
                                <span>Verified Badge</span>
                            </li>
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full"
                            size="lg"
                            onClick={() => router.push(user ? '/agent/dashboard' : '/register')}
                        >
                            {user ? (currentTier === 'starter' ? 'Current Plan' : 'Downgrade') : 'Get Started Free'}
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col relative ${currentTier === 'pro' ? 'ring-2 ring-green-500' : ''}`}>
                        {currentTier === 'pro' && (
                            <div className="text-xs font-bold text-green-600 mb-4">CURRENT PLAN</div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-primary mb-2">Pro Agent</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">₦{getPrice('pro').toLocaleString()}</span>
                                <span className="text-gray-500 text-sm">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                            </div>
                            {billingCycle === 'annual' && (
                                <p className="text-green-600 text-xs mt-1">
                                    Save ₦{getSavings('pro').toLocaleString()}/year
                                </p>
                            )}
                            <p className="text-gray-500 mt-2 text-sm">For individual agents.</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1 text-sm">
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                <span><strong>30</strong> Active Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                <span><strong>3</strong> Featured Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>"Verified Agent" Badge</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>Priority Support</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X className="h-4 w-4 flex-shrink-0" />
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
                                label="Upgrade to Pro"
                                site="land"
                            />
                        )}
                    </div>

                    {/* Business Plan */}
                    <div className={`bg-white rounded-2xl shadow-lg border-2 border-primary p-6 flex flex-col relative overflow-hidden ${currentTier === 'business' ? 'ring-2 ring-green-500' : ''}`}>
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            BEST VALUE
                        </div>
                        {currentTier === 'business' && (
                            <div className="text-xs font-bold text-green-600 mb-4">CURRENT PLAN</div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-primary mb-2">Business</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">₦{getPrice('business').toLocaleString()}</span>
                                <span className="text-gray-500 text-sm">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                            </div>
                            {billingCycle === 'annual' && (
                                <p className="text-green-600 text-xs mt-1">
                                    Save ₦{getSavings('business').toLocaleString()}/year
                                </p>
                            )}
                            <p className="text-gray-500 mt-2 text-sm">For growing teams.</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1 text-sm">
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                <span><strong>100</strong> Active Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                <span><strong>10</strong> Featured Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>"Verified Agent" Badge</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>Priority Support</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>Analytics Dashboard</span>
                            </li>
                        </ul>

                        {currentTier === 'business' ? (
                            <Button variant="outline" className="w-full" size="lg" disabled>
                                Current Plan
                            </Button>
                        ) : (
                            <PaystackButton
                                amount={getPrice('business')}
                                email={user?.email || ""}
                                publicKey={PAYSTACK_PUBLIC_KEY}
                                onSuccess={(ref) => handleSuccess(ref, 'business')}
                                onClose={handleClose}
                                user={user}
                                label="Upgrade to Business"
                                site="land"
                            />
                        )}
                    </div>

                    {/* Agency Plan */}
                    <div className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col relative ${currentTier === 'agency' ? 'ring-2 ring-green-500' : ''}`}>
                        {currentTier === 'agency' && (
                            <div className="text-xs font-bold text-green-600 mb-4">CURRENT PLAN</div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Agency
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">₦{getPrice('agency').toLocaleString()}</span>
                                <span className="text-gray-500 text-sm">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                            </div>
                            {billingCycle === 'annual' && (
                                <p className="text-green-600 text-xs mt-1">
                                    Save ₦{getSavings('agency').toLocaleString()}/year
                                </p>
                            )}
                            <p className="text-gray-500 mt-2 text-sm">For agencies & developers.</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1 text-sm">
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span><strong>Unlimited</strong> Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                <span><strong>Unlimited</strong> Featured Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>"Verified Agency" Badge</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>Dedicated Account Manager</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-green-500 flex-shrink-0" />
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
                                site="land"
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

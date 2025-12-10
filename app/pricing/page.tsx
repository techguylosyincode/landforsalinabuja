"use client";

import { Button } from "@/components/ui/button";
import { Check, Shield, Zap } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Replace with your actual Paystack Public Key
// For testing, use a test key: pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
const PAYSTACK_PUBLIC_KEY = "pk_test_c9c03d9bc9dd6f9b43f70bbc9c1783e5ad72b730";

export default function PricingPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();
    }, []);

    const handleSuccess = async (reference: any) => {
        // Verify transaction on server
        const response = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: reference.reference, userId: user?.id })
        });

        if (response.ok) {
            alert("Payment successful! You are now a Premium Agent.");
            router.push('/agent/dashboard');
        } else {
            alert("Payment verification failed. Please contact support.");
        }
    };

    const handleClose = () => {
        console.log("Payment closed");
    };

    const PayButton = ({ amount, email }: { amount: number, email: string }) => {
        const config = {
            reference: (new Date()).getTime().toString(),
            email: email,
            amount: amount * 100, // Amount in kobo
            publicKey: PAYSTACK_PUBLIC_KEY,
        };

        const initializePayment = usePaystackPayment(config);

        return (
            <Button
                className="w-full"
                size="lg"
                onClick={() => {
                    if (!user) {
                        router.push('/login?next=/pricing');
                        return;
                    }
                    initializePayment({ onSuccess: handleSuccess, onClose: handleClose });
                }}
            >
                Choose Premium
            </Button>
        );
    };

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading plans...</div>;

    return (
        <main className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-gray-600">Choose the plan that helps you sell land faster in Abuja.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-500 mb-2">Starter</h3>
                            <div className="text-4xl font-bold">Free</div>
                            <p className="text-gray-500 mt-2">Forever free for new agents.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>1 Active Listing</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>Basic Search Visibility</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>Standard Support</span>
                            </li>
                        </ul>
                        <Button variant="outline" className="w-full" size="lg" asChild>
                            <a href={user ? "/agent/dashboard" : "/register"}>
                                {user ? "Go to Dashboard" : "Get Started"}
                            </a>
                        </Button>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-primary p-8 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            RECOMMENDED
                        </div>
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-primary mb-2">Premium Agent</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">₦15,000</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <p className="text-gray-500 mt-2">For serious agents and developers.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-primary" />
                                <span><strong>Unlimited</strong> Listings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                <span><strong>Featured</strong> Listings (Top of Search)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-primary" />
                                <span>"Verified Agent" Badge</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-primary" />
                                <span>Priority Support</span>
                            </li>
                        </ul>

                        <PayButton amount={15000} email={user?.email || ""} />
                    </div>
                </div>
            </div>
        </main>
    );
}

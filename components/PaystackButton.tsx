"use client";

import { Button } from "@/components/ui/button";
import { usePaystackPayment } from "react-paystack";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

// Original interface for backwards compatibility
interface PaystackButtonPropsLegacy {
    amount: number;
    email: string;
    publicKey: string;
    onSuccess: (reference: any) => void;
    onClose: () => void;
    user: any;
    label?: string;
    site?: string;
}

// New interface for payment page
interface PaystackButtonPropsNew {
    amount: number;
    email: string;
    planType?: string;
    planName?: string;
    billingCycle?: "monthly" | "annually";
    onPaymentStart?: () => void;
    onPaymentSuccess?: () => void;
    onPaymentError?: () => void;
    disabled?: boolean;
}

export type PaystackButtonProps = PaystackButtonPropsLegacy | PaystackButtonPropsNew;

// Type guard to check if using new interface
function isNewInterface(props: PaystackButtonProps): props is PaystackButtonPropsNew {
    return 'planType' in props || 'onPaymentSuccess' in props;
}

const PaystackButton = (props: PaystackButtonProps) => {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
    const site = "land";

    if (isNewInterface(props)) {
        // New interface for payment/upgrade page
        const { amount, email, planType, planName, billingCycle, onPaymentStart, onPaymentSuccess, onPaymentError, disabled } = props;

        const config = {
            reference: `${site}_${planType || 'subscription'}_${userId || "unknown"}_${billingCycle || 'monthly'}_${Date.now()}`,
            email: email,
            amount: amount * 100, // Amount in kobo
            publicKey: publicKey,
        };

        const initializePayment = usePaystackPayment(config);

        const handlePaymentSuccess = async (reference: any) => {
            try {
                // Call API to verify payment and update subscription
                const response = await fetch("/api/paystack/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        reference: reference.reference,
                        planType,
                        billingCycle,
                    }),
                });

                if (response.ok) {
                    onPaymentSuccess?.();
                } else {
                    console.error("Payment verification failed");
                    onPaymentError?.();
                }
            } catch (error) {
                console.error("Payment verification error:", error);
                onPaymentError?.();
            }
        };

        return (
            <Button
                className="w-full bg-[#003087] hover:bg-[#002060]"
                size="lg"
                disabled={disabled || !publicKey}
                onClick={() => {
                    onPaymentStart?.();
                    initializePayment({
                        onSuccess: handlePaymentSuccess,
                        onClose: () => onPaymentError?.(),
                    });
                }}
            >
                Pay ₦{amount.toLocaleString()} - {planName || "Upgrade"}
            </Button>
        );
    } else {
        // Legacy interface
        const { amount, email, publicKey: legacyPublicKey, onSuccess, onClose, user, label = "Upgrade Now", site: legacySite = "land" } = props;

        const config = {
            reference: `${legacySite}_subscription_${user?.id || "unknown"}_${Date.now()}`,
            email: email,
            amount: amount * 100,
            publicKey: legacyPublicKey,
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
                    initializePayment({ onSuccess, onClose });
                }}
            >
                {label}
            </Button>
        );
    }
};

export default PaystackButton;

"use client";

import { Button } from "@/components/ui/button";
import { usePaystackPayment } from "react-paystack";
import { useRouter } from "next/navigation";

interface PaystackButtonProps {
    amount: number;
    email: string;
    publicKey: string;
    onSuccess: (reference: any) => void;
    onClose: () => void;
    user: any;
    label?: string;
    site?: string; // Site identifier (land, house, 9ja) for multi-site webhook routing
}

const PaystackButton = ({ amount, email, publicKey, onSuccess, onClose, user, label = "Upgrade Now", site = "land" }: PaystackButtonProps) => {
    const router = useRouter();

    const config = {
        reference: `${site}_subscription_${user?.id || "unknown"}_${(new Date()).getTime()}`,
        email: email,
        amount: amount * 100, // Amount in kobo
        publicKey: publicKey,
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
};

export default PaystackButton;

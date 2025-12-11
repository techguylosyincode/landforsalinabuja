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
}

const PaystackButton = ({ amount, email, publicKey, onSuccess, onClose, user, label = "Upgrade Now" }: PaystackButtonProps) => {
    const router = useRouter();

    const config = {
        reference: (new Date()).getTime().toString(),
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

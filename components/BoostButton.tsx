"use client";

import { Button } from "@/components/ui/button";
import { usePaystackPayment } from "react-paystack";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap, X, Loader2 } from "lucide-react";

const PAYSTACK_PUBLIC_KEY = "pk_test_c9c03d9bc9dd6f9b43f70bbc9c1783e5ad72b730";

const BOOST_OPTIONS = [
    { duration: '7', days: 7, price: 3000, label: '7 Days' },
    { duration: '14', days: 14, price: 5000, label: '14 Days', popular: true },
    { duration: '30', days: 30, price: 8000, label: '30 Days' },
];

interface BoostButtonProps {
    propertyId: string;
    propertyTitle: string;
    userEmail: string;
    onSuccess?: () => void;
}

export default function BoostButton({ propertyId, propertyTitle, userEmail, onSuccess }: BoostButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState(BOOST_OPTIONS[1]); // Default to 14 days
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const config = {
        reference: `boost_${propertyId}_${Date.now()}`,
        email: userEmail,
        amount: selectedOption.price * 100, // kobo
        publicKey: PAYSTACK_PUBLIC_KEY,
    };

    const initializePayment = usePaystackPayment(config);

    const handleSuccess = async (reference: any) => {
        setProcessing(true);
        try {
            const response = await fetch('/api/boost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: reference.reference,
                    propertyId,
                    duration: selectedOption.duration
                })
            });

            if (response.ok) {
                alert(`Your listing is now featured for ${selectedOption.days} days!`);
                setShowModal(false);
                onSuccess?.();
                router.refresh();
            } else {
                alert("Boost verification failed. Please contact support.");
            }
        } catch (error) {
            console.error("Boost error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        console.log("Payment closed");
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-1 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                onClick={() => setShowModal(true)}
            >
                <Zap className="h-4 w-4" />
                Boost
            </Button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Zap className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-bold">Boost Your Listing</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Get more visibility and appear at the top of search results
                            </p>
                        </div>

                        <p className="text-sm text-gray-500 mb-4 truncate">
                            {propertyTitle}
                        </p>

                        <div className="space-y-3 mb-6">
                            {BOOST_OPTIONS.map((option) => (
                                <button
                                    key={option.duration}
                                    onClick={() => setSelectedOption(option)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all relative ${
                                        selectedOption.duration === option.duration
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {option.popular && (
                                        <span className="absolute -top-2 right-3 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                            Best Value
                                        </span>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-semibold">{option.label}</span>
                                            <span className="text-gray-500 text-sm ml-2">featured listing</span>
                                        </div>
                                        <span className="font-bold text-lg">₦{option.price.toLocaleString()}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Button
                            className="w-full gap-2"
                            size="lg"
                            disabled={processing}
                            onClick={() => {
                                initializePayment({ onSuccess: handleSuccess, onClose: handleClose });
                            }}
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Zap className="h-4 w-4" />
                            )}
                            {processing ? "Processing..." : `Pay ₦${selectedOption.price.toLocaleString()}`}
                        </Button>

                        <p className="text-xs text-gray-400 text-center mt-4">
                            One-time payment. No subscription required.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

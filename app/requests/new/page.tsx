'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBuyerRequest } from "@/actions/requests";
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewRequestPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await createBuyerRequest(formData);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Request Sent!</h1>
                    <p className="text-gray-600 mb-8">
                        Your request has been broadcast to our network of verified agents. They will contact you shortly with matching properties.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/">Return Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-4">Post a Request</h1>
                    <p className="text-gray-600">
                        Can't find what you're looking for? Tell us what you need, and verified agents will find it for you.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border">
                    <form action={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                                <Input name="name" required placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <Input name="phone" required placeholder="080..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <Input name="email" type="email" required placeholder="john@example.com" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                                <Input name="location" placeholder="e.g. Guzape, Maitama" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (₦)</label>
                                <Input name="budget" type="number" placeholder="e.g. 50000000" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                            <select name="property_type" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="Land">Land</option>
                                <option value="House">House</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Describe what you need *</label>
                            <Textarea
                                name="description"
                                required
                                placeholder="I am looking for a 500sqm plot with C of O..."
                                className="h-32"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                </>
                            ) : (
                                "Submit Request"
                            )}
                        </Button>

                        <p className="text-xs text-center text-gray-500 mt-4">
                            By submitting, you agree to share your contact details with verified agents on our platform.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Briefcase } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accountType, setAccountType] = useState<'individual' | 'agent' | 'agency'>('individual');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const fullName = formData.get("full_name") as string;
        const phone = formData.get("phone") as string;
        const agency = formData.get("agency") as string;

        const supabase = createClient();

        // 1. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            // 2. Create the profile with selected role
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    full_name: fullName,
                    phone_number: phone,
                    agency_name: accountType === 'agency' ? agency : null,
                    role: accountType, // 'individual', 'agent', or 'agency'
                    is_verified: false,
                    subscription_tier: 'starter' // Everyone starts as starter/free
                });

            if (profileError) {
                console.error("Profile creation error:", profileError);
            }

            // 3. Show Success Message (No Redirect)
            alert("Registration successful! Please check your email to verify your account.");
            router.push("/login");
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join the fastest growing real estate network in Abuja.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

                    {/* Account Type Selector */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">I am a...</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setAccountType('individual')}
                                className={`flex flex-col items-center justify-center p-3 border rounded-lg text-sm transition-all ${accountType === 'individual'
                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <User className="h-5 w-5 mb-1" />
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType('agent')}
                                className={`flex flex-col items-center justify-center p-3 border rounded-lg text-sm transition-all ${accountType === 'agent'
                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <Briefcase className="h-5 w-5 mb-1" />
                                Agent
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType('agency')}
                                className={`flex flex-col items-center justify-center p-3 border rounded-lg text-sm transition-all ${accountType === 'agency'
                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <Building2 className="h-5 w-5 mb-1" />
                                Agency
                            </button>
                        </div>
                    </div>

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <Input id="full_name" name="full_name" required placeholder="John Doe" className="mt-1" />
                        </div>

                        {accountType === 'agency' && (
                            <div>
                                <label htmlFor="agency" className="block text-sm font-medium text-gray-700">Agency Name</label>
                                <Input id="agency" name="agency" required placeholder="Abuja Real Estate Ltd" className="mt-1" />
                            </div>
                        )}

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <Input id="phone" name="phone" required placeholder="08012345678" className="mt-1" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <Input id="email" name="email" type="email" required placeholder="email@example.com" className="mt-1" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <Input id="password" name="password" type="password" required placeholder="••••••••" className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating Account..." : "Register"}
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div >
        </main >
    );
}

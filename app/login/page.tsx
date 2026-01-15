"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            console.log("Login: Starting sign in for", email);
            const supabase = createClient();
            const { data: signInData, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log("Login: Sign in result - session:", !!signInData?.session, "error:", error?.message);

            if (error) {
                console.error("Login error:", error);
                if (error.message === "Invalid login credentials") {
                    setError("Invalid email or password. Please check your credentials and try again.");
                } else {
                    setError(error.message);
                }
                return;
            }

            // Check email verification status and payment before redirecting
            console.log("Login: Fetching user details");
            const { data: { user } } = await supabase.auth.getUser();
            console.log("Login: User fetched:", user?.id);
            if (user) {
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("email_verified, subscription_tier, payment_required")
                    .eq("id", user.id)
                    .single();

                console.log("Login: Profile data:", profileData, "Error:", profileError?.message);

                if (profileData) {
                    // Freemium model: only check email verification
                    if (!profileData.email_verified) {
                        console.log("Login: Email not verified, blocking access");
                        setError("Please verify your email before accessing your dashboard. Check your inbox for the verification link.");
                        return;
                    }

                    console.log("Login: Email verified, redirecting to dashboard");
                }
            }

            // Hard redirect to ensure session cookies are picked by server components immediately
            window.location.href = "/agent/dashboard";
        } catch (err: any) {
            console.error("Login failed:", err);
            setError("Unable to reach the server. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{" "}
                        <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                            create a new agent account
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Email address"
                                className="rounded-t-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Password"
                                className="rounded-b-md"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                href="/forgot-password"
                                className="font-medium text-primary hover:text-primary/80"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert("Please contact support to reset your password.");
                                }}
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}

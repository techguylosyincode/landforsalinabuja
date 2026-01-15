"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CheckCircle, AlertCircle, Lock } from "lucide-react";

const PaystackButton = dynamic(() => import("@/components/PaystackButton"), { ssr: false });

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  subscription_tier: string | null;
  email_verified: boolean;
};

const PLANS = [
  {
    id: "pro",
    name: "Pro",
    price: 5000,
    period: "month",
    annually: 50000,
    features: [
      "15 Active Listings",
      "1 Featured Listing",
      "Verified Badge",
      "Priority Support",
      "Analytics Dashboard",
    ],
    description: "Best for individual agents",
  },
  {
    id: "agency",
    name: "Agency",
    price: 15000,
    period: "month",
    annually: 150000,
    features: [
      "Unlimited Listings",
      "Unlimited Featured",
      "Agency Branding",
      "Team Management (up to 5 agents)",
      "Advanced Analytics",
      "24/7 Priority Support",
    ],
    description: "Best for agencies and teams",
  },
];

export default function OnboardingPaymentPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "agency">("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    console.log("Payment page: useEffect mounted");
    let isMounted = true;

    const checkUserStatus = async () => {
      try {
        console.log("Payment page: Starting checkUserStatus...");

        const supabase = createClient();
        console.log("Payment page: Supabase client created");

        // First check if we have a session at all
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log("Payment page: Session check - has session:", !!sessionData?.session, "error:", sessionError?.message);

        if (sessionError || !sessionData?.session) {
          console.log("Payment page: No session found, redirecting to login");
          if (isMounted) {
            setError("Please log in to access this page.");
            setLoading(false);
            // Use replace instead of push to prevent back button issues
            router.replace("/login");
          }
          return;
        }

        // Now try to get user details
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log("Payment page: Got auth user:", user?.id, "Error:", authError?.message);

        if (authError || !user) {
          console.log("Payment page: Auth error or no user, redirecting to login");
          // Check for specific refresh token error
          if (authError?.message?.includes("Refresh Token") || authError?.message?.includes("refresh_token")) {
            console.log("Payment page: Refresh token invalid, clearing session");
            await supabase.auth.signOut();
          }
          if (isMounted) {
            setError("Session expired. Please log in again.");
            setLoading(false);
            router.replace("/login");
          }
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email_verified, subscription_tier, payment_required")
          .eq("id", user.id)
          .single();

        console.log("Payment page: Profile data:", profileData);
        console.log("Payment page: Profile error:", profileError);

        if (profileError || !profileData) {
          console.error("Payment page: Profile fetch failed:", profileError);
          setError("Profile not found. Please try refreshing the page.");
          setLoading(false);
          return;
        }

        // If already has active subscription, redirect to dashboard
        if (profileData.subscription_tier && profileData.subscription_tier !== "starter") {
          console.log("Payment page: Already has subscription, redirecting to dashboard");
          setLoading(false);
          router.push("/agent/dashboard");
          return;
        }

        console.log("Payment page: Setting profile and showing payment options");
        setProfile({
          id: user.id,
          full_name: profileData.full_name || "User",
          email: user.email || "",
          subscription_tier: profileData.subscription_tier,
          email_verified: profileData.email_verified,
        });
        setLoading(false);
      } catch (err) {
        console.error("Payment page: Catch block error:", err);
        console.error("Payment page: Error type:", typeof err);
        console.error("Payment page: Error message:", err instanceof Error ? err.message : String(err));
        console.error("Payment page: Error stack:", err instanceof Error ? err.stack : "No stack");

        // Check if it's a refresh token error
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("Refresh Token") || errorMessage.includes("refresh_token") || errorMessage.includes("invalid_grant")) {
          console.log("Payment page: Caught refresh token error, redirecting to login");
          if (isMounted) {
            setError("Session expired. Please log in again.");
            setLoading(false);
            router.replace("/login");
          }
        } else {
          if (isMounted) {
            setError("An error occurred. Please try refreshing the page.");
            setLoading(false);
          }
        }
      }
    };

    checkUserStatus();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003087] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            Error
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {error || "Unable to load payment page"}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-[#003087] hover:bg-[#002060] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan)!;
  const price = billingCycle === "monthly" ? selectedPlanData.price : selectedPlanData.annually;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header with branding */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Upgrade Your Plan
          </h1>
          <p className="text-lg text-gray-600">
            {profile.full_name}, upgrade to list more properties and unlock premium features.
          </p>
        </div>

        {/* Current plan message */}
        <div className="flex items-center justify-center gap-2 text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200 mb-8">
          <CheckCircle className="h-5 w-5" />
          <span>You're currently on the Free plan (1 listing). Upgrade to list more!</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-sm p-1 border inline-flex">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-[#003087] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
                billingCycle === "annually"
                  ? "bg-[#003087] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annually
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as "pro" | "agency")}
              className={`relative rounded-xl border-2 transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? "border-[#003087] bg-white shadow-lg scale-105"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* Plan Header */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>
                  {selectedPlan === plan.id && (
                    <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                  )}
                </div>

                {/* Price */}
                <div className="my-6">
                  <div className="text-4xl font-bold text-gray-900">
                    ₦{price.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    per {billingCycle === "monthly" ? "month" : "year"}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Payment Button - Only show for selected plan */}
                {selectedPlan === plan.id && (
                  <div className="mt-8 pt-8 border-t">
                    <PaystackButton
                      email={profile.email}
                      amount={price}
                      planType={plan.id}
                      planName={plan.name}
                      billingCycle={billingCycle}
                      onPaymentStart={() => setProcessingPayment(true)}
                      onPaymentSuccess={() => {
                        setProcessingPayment(false);
                        router.push("/agent/dashboard");
                      }}
                      onPaymentError={() => setProcessingPayment(false)}
                      disabled={processingPayment}
                    />
                    <p className="text-xs text-gray-500 text-center mt-4">
                      <Lock className="inline w-3 h-3 mr-1" />
                      Your payment is secured by Paystack
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div className="text-blue-600 flex-shrink-0 mt-0.5">ℹ️</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Why upgrade?</h4>
              <p className="text-blue-800 text-sm">
                Upgrading gives you access to more listings, verified badge for trust,
                featured placement for more visibility, and priority support.
                Your free listing stays active - upgrading simply unlocks more capacity.
                All payments are secured and handled by Paystack.
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-12 space-y-4">
          <div>
            <a
              href="/agent/dashboard"
              className="text-[#003087] hover:underline font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
          <p className="text-gray-600">
            Having trouble? <a href="mailto:support@landforsaleinabuja.ng" className="text-[#003087] hover:underline font-medium">
              Contact our support team
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-16 pt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            © 2026 Land For Sale in Abuja. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}

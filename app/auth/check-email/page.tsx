"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle } from "lucide-react";

export default function CheckEmailPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const checkAuth = async () => {
      try {
        console.log("Check email page: Checking auth status");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log("Check email page: No user found, redirecting to login");
          router.push("/login");
          return;
        }

        if (!isMounted) return;

        console.log("Check email page: User found:", user.id);
        setUserEmail(user.email || null);

        // Check if email is already verified
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_verified")
          .eq("id", user.id)
          .single();

        if (!isMounted) return;

        console.log("Check email page: Email verified status:", profile?.email_verified);

        if (profile?.email_verified) {
          // Already verified, redirect to dashboard (freemium: 1 free listing)
          console.log("Check email page: Email verified, redirecting to dashboard");
          router.push("/agent/dashboard");
          return;
        }

        console.log("Check email page: Email not yet verified, showing check email page");
        setIsLoading(false);

        // Set up polling to check for verification every 3 seconds
        pollInterval = setInterval(async () => {
          try {
            const { data: updatedProfile } = await supabase
              .from("profiles")
              .select("email_verified")
              .eq("id", user.id)
              .single();

            if (updatedProfile?.email_verified) {
              console.log("Check email page: Email verified via polling, redirecting to dashboard");
              if (isMounted) {
                router.push("/agent/dashboard");
              }
            }
          } catch (err) {
            console.error("Check email page: Polling error:", err);
          }
        }, 3000);
      } catch (error) {
        console.error("Check email page: Error checking auth:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003087] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Mail className="w-12 h-12 text-[#003087]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Check Your Email
        </h1>

        <p className="text-gray-600 text-center mb-6">
          We've sent a verification link to:
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-center font-semibold text-gray-900">
            {userEmail}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Click the verification link in your email
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              You'll automatically proceed to choose your plan
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              The link expires in 24 hours
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <p className="text-sm text-gray-600 text-center mb-4">
            Didn't receive the email? Check your spam folder.
          </p>
          <Link
            href="/"
            className="w-full inline-block bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            Return to Home
          </Link>
        </div>

        <div className="mt-6 text-center">
          <a href="mailto:support@landforsaleinabuja.ng" className="text-sm text-[#003087] hover:underline">
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}

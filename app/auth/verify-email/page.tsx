"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader, ArrowRight, Home } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const email = searchParams.get("email");

        console.log("Verify email page: token =", token);
        console.log("Verify email page: email =", email);

        if (!token || !email) {
          console.log("Verify email page: Missing token or email");
          if (isMounted) {
            setStatus("error");
            setMessage("Invalid verification link. Missing token or email.");
          }
          return;
        }

        console.log("Verify email page: Calling API to verify email");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("Verify email page: API response status =", response.status);
        const data = await response.json();
        console.log("Verify email page: API response data =", data);

        if (!isMounted) return;

        if (response.ok) {
          console.log("Verify email page: Setting status to success");
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          console.log("Verify email page: Setting status to error");
          setStatus("error");
          setMessage(data.error || "Failed to verify email. Please try again.");
        }
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof Error && error.name === 'AbortError') {
          console.error("Verify email page: Request timeout");
          setStatus("error");
          setMessage("Request timed out. Please try refreshing the page.");
        } else {
          console.error("Verify email page: Catch error =", error);
          setStatus("error");
          setMessage("An error occurred. Please try again later.");
        }
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header with branding */}
      <div className="bg-gradient-to-r from-[#003087] to-[#1e5a96] px-4 py-6 text-white">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold">Land For Sale in Abuja</h1>
          <p className="text-sm text-white/80 mt-1">Email Verification</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Loading State */}
          {status === "loading" && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
              <div className="flex justify-center">
                <Loader className="w-16 h-16 text-[#003087] animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Email
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
              <div className="pt-4">
                <div className="h-1 bg-gray-200 rounded overflow-hidden">
                  <div className="h-full bg-[#003087] animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Success header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 border-b border-green-100">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                    <div className="absolute inset-0 animate-ping opacity-20 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Email Verified!
                </h2>
                <p className="text-green-700 text-center font-medium">
                  Your account is now active
                </p>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    Welcome to <strong>Land For Sale in Abuja</strong>! Your email has been successfully verified and your account is ready to use.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Email Verified</p>
                      <p className="text-sm text-gray-600">Your email address is confirmed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Account Active</p>
                      <p className="text-sm text-gray-600">You can now log in and access all features</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm font-medium">
                    You now have access to 1 FREE property listing! Log in to start listing.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#002060] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Log In to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Error header */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 border-b border-red-100">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="w-20 h-20 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Verification Failed
                </h2>
                <p className="text-red-700 text-center font-medium">
                  We couldn't verify your email
                </p>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    <strong>Error:</strong> {message}
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#002060] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Back to Login
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/register"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Register Again
                  </Link>
                </div>

                <div className="border-t border-gray-200 pt-6 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Still having issues?
                  </p>
                  <a
                    href="mailto:support@landforsaleinabuja.ng"
                    className="inline-block text-[#003087] hover:underline font-medium text-sm"
                  >
                    Contact our support team
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 px-4 text-center text-sm">
        <p className="text-gray-400">
          © 2026 Land For Sale in Abuja. All rights reserved.
        </p>
      </div>
    </main>
  );
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-16 h-16 text-[#003087] animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

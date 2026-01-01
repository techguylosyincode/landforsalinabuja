'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Error Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h2>

        {/* Error Description */}
        <p className="text-lg text-gray-600 mb-8">
          We encountered an unexpected error while loading this page. Our team has been notified and we're working to fix it.
        </p>

        {/* Error Details (if available) */}
        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-red-800 font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact us at{' '}
            <a href="mailto:support@landforsaleinabuja.ng" className="text-primary hover:underline">
              support@landforsaleinabuja.ng
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

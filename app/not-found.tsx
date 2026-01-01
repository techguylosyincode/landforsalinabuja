import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-primary opacity-10 mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or may have been moved. But don't worry, we have plenty of land available to help you find your next investment opportunity.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5">
            <Link href="/buy">
              <Search className="mr-2 h-5 w-5" />
              Search Properties
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/blog" className="text-primary hover:underline">
              Guides & Tips
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/sell" className="text-primary hover:underline">
              Sell Land
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/pricing" className="text-primary hover:underline">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

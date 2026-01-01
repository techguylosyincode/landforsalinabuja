import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Cookie Policy | LandForSaleInAbuja.ng",
  description: "How we use cookies on our platform.",
  alternates: {
    canonical: 'https://landforsaleinabuja.ng/cookies'
  },
  robots: 'noindex, follow'
};

export default function CookiesPage() {
  const lastUpdated = 'December 31, 2024';

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: {lastUpdated}</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700">
                Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and understand how you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>

              <h3 className="text-xl font-bold text-gray-800 mb-3">1. Essential Cookies</h3>
              <p className="text-gray-700 mb-4">
                Required for the platform to function. These cannot be disabled.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Authentication:</strong> Keep you logged in to your account</li>
                <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
                <li><strong>Session Management:</strong> Remember your preferences during your visit</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mb-3 mt-6">2. Analytics Cookies</h3>
              <p className="text-gray-700 mb-4">
                Help us understand how users interact with our platform.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Google Analytics (if enabled in the future)</li>
                <li>Page view tracking</li>
                <li>User journey analysis</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mb-3 mt-6">3. Preference Cookies</h3>
              <p className="text-gray-700 mb-4">
                Remember your settings and preferences.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Language preferences</li>
                <li>Display settings</li>
                <li>Search filters</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">We use services from third parties that may set cookies:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Paystack:</strong> For payment processing</li>
                <li><strong>Supabase:</strong> For authentication and database services</li>
              </ul>
              <p className="text-gray-700 mt-4">
                These third parties have their own privacy policies governing their use of cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="text-gray-800">
                  <strong>Note:</strong> Disabling essential cookies may prevent you from using certain features of our platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                Questions about our use of cookies? Contact us at <a href="mailto:support@landforsaleinabuja.ng" className="text-primary hover:underline">support@landforsaleinabuja.ng</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | LandForSaleInAbuja.ng",
  description: "Our commitment to protecting your privacy and data security.",
  alternates: {
    canonical: 'https://landforsaleinabuja.ng/privacy'
  },
  robots: 'noindex, follow'
};

export default function PrivacyPage() {
  const lastUpdated = 'December 31, 2024';

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: {lastUpdated}</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                When you use LandForSaleInAbuja.ng, we collect the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number</li>
                <li><strong>Property Listings:</strong> Details of land you list for sale</li>
                <li><strong>Payment Information:</strong> Processed securely through Paystack (we don't store card details)</li>
                <li><strong>Usage Data:</strong> How you interact with our platform (pages visited, time spent)</li>
                <li><strong>Device Information:</strong> Browser type, IP address, device type</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Facilitate connections between buyers and sellers</li>
                <li>Process your subscription payments</li>
                <li>Send you notifications about your listings and inquiries</li>
                <li>Improve our platform and user experience</li>
                <li>Comply with legal obligations under Nigerian law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">We share information only in these circumstances:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Public Listings:</strong> Property listings you create are publicly visible</li>
                <li><strong>Buyer-Seller Connections:</strong> We share your contact info with interested buyers when they inquire</li>
                <li><strong>Payment Processing:</strong> Paystack processes payments (subject to their privacy policy)</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by Nigerian law</li>
                <li><strong>We Never Sell Your Data:</strong> Your information is never sold to third parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure database hosting with Supabase</li>
                <li>Regular security audits</li>
                <li>Compliance with the Nigeria Data Protection Regulation (NDPR)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">Under NDPR, you have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, contact us at <a href="mailto:support@landforsaleinabuja.ng" className="text-primary hover:underline">support@landforsaleinabuja.ng</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies to improve your experience. See our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700">
                For questions about this Privacy Policy, contact us at:<br/>
                Email: <a href="mailto:support@landforsaleinabuja.ng" className="text-primary hover:underline">support@landforsaleinabuja.ng</a><br/>
                Address: Abuja, FCT, Nigeria
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service | LandForSaleInAbuja.ng",
  description: "Terms and conditions for using our platform.",
  alternates: {
    canonical: 'https://landforsaleinabuja.ng/terms'
  },
  robots: 'noindex, follow'
};

export default function TermsPage() {
  const lastUpdated = 'December 31, 2024';

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last Updated: {lastUpdated}</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using LandForSaleInAbuja.ng, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Platform Overview</h2>
              <p className="text-gray-700 mb-4">
                LandForSaleInAbuja.ng is a <strong>marketplace platform</strong> that connects land sellers and buyers in Abuja. We are <strong>not</strong> a real estate agency, broker, or legal advisor.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>We do not own, sell, or broker land</li>
                <li>We do not verify property ownership or titles (users must verify independently)</li>
                <li>We facilitate connections only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <h3 className="text-xl font-bold text-gray-800 mb-3">For Sellers/Agents:</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You must have legal authority to list the property</li>
                <li>All information must be accurate and truthful</li>
                <li>You must not post fraudulent or misleading listings</li>
                <li>You are responsible for all legal aspects of the sale</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mb-3 mt-6">For Buyers:</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You must conduct independent verification of all property details</li>
                <li>Verify land titles with AGIS (Abuja Geographic Information Systems)</li>
                <li>Engage a lawyer before making any payment</li>
                <li>You are solely responsible for your purchase decisions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Listing Guidelines</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>One property per listing (no duplicates)</li>
                <li>Accurate pricing, size, and location information</li>
                <li>Real photos of the property (not stock images)</li>
                <li>We reserve the right to remove listings that violate guidelines</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payments & Subscriptions</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Subscription fees are for platform access, not property transactions</li>
                <li>Payments are processed securely through Paystack</li>
                <li>Subscription fees are <strong>non-refundable</strong></li>
                <li>You can cancel anytime (access continues until end of billing period)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-gray-800 font-semibold">IMPORTANT: Please Read Carefully</p>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>LandForSaleInAbuja.ng is not liable for:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Accuracy of property listings</li>
                <li>Property ownership disputes</li>
                <li>Fraudulent listings or scams</li>
                <li>Failed transactions or legal issues</li>
                <li>Any direct or indirect damages from using our platform</li>
              </ul>
              <p className="text-gray-700 mt-4">
                <strong>You use this platform at your own risk. Always verify property details with AGIS and consult a lawyer.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Activities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Posting fake or fraudulent listings</li>
                <li>Harassment of other users</li>
                <li>Spamming or unsolicited marketing</li>
                <li>Attempting to bypass payment systems</li>
                <li>Scraping or unauthorized data collection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Account Termination</h2>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm the platform's reputation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in Nigerian courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these terms at any time. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact</h2>
              <p className="text-gray-700">
                Questions about these Terms? Contact us at <a href="mailto:support@landforsaleinabuja.ng" className="text-primary hover:underline">support@landforsaleinabuja.ng</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Pricing Plans | LandForSaleInAbuja.ng",
  description: "Choose the plan that helps you sell land faster. Free starter plan, Pro agent (₦5,000/mo), or Agency (₦15,000/mo).",
  alternates: {
    canonical: 'https://landforsaleinabuja.ng/pricing'
  },
  openGraph: {
    title: "Pricing Plans - LandForSaleInAbuja.ng",
    description: "Affordable plans for agents and agencies. Start free.",
    url: "https://landforsaleinabuja.ng/pricing",
    type: "website",
  },
  twitter: {
    card: 'summary',
    site: '@landinabuja',
    title: "Pricing Plans - LandForSaleInAbuja.ng",
    description: "Affordable plans for agents and agencies. Start free.",
    images: ['https://landforsaleinabuja.ng/logo.svg'],
  }
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

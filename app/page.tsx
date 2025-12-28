import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ShieldCheck, Users, ArrowRight, TrendingUp, MapPin, Wallet, Building2, ChevronRight } from "lucide-react";
import FeaturedListings from "@/components/FeaturedListings";
import HeroSearchForm from "@/components/HeroSearchForm";

import { createClient } from "@/lib/supabase/server";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Land for Sale in Abuja | Buy Verified Land with C of O",
  description: "Find verified land for sale in Abuja. Browse listings in Maitama, Asokoro, Guzape, Wuse II, and more. Direct from owners and verified agents.",
  openGraph: {
    title: "Land for Sale in Abuja | Buy Verified Land",
    description: "Find verified land for sale in Abuja. Browse listings in Maitama, Asokoro, Guzape, Wuse II, and more.",
    url: "https://landforsaleinabuja.ng",
    siteName: "LandForSaleInAbuja.ng",
    locale: "en_NG",
    type: "website",
  },
};

// Define Property type matching PropertyCard props
type Property = {
  id: string;
  title: string;
  price: number;
  district: string;
  size: number;
  image: string;
  titleType: string;
  slug: string;
};

export const revalidate = 300;

export default async function Home() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Fetch initial 30 properties
  const { data } = await supabase
    .from('properties')
    .select('id, title, price, size_sqm, district, images, title_type, slug, is_featured, featured_until')
    .or(`is_featured.eq.false,and(is_featured.eq.true,featured_until.gt.${now})`)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);



  // Get total count for pagination
  const { count } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Smart Mix Logic: Prioritize diversity of districts
  const allProperties = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    district: p.district,
    size: p.size_sqm || p.size,
    image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
    titleType: p.title_type,
    slug: p.slug || p.id
  }));

  // Group by district
  const districtGroups = new Map<string, Property[]>();
  allProperties.forEach((p: Property) => {
    const d = p.district || 'Other';
    if (!districtGroups.has(d)) {
      districtGroups.set(d, []);
    }
    districtGroups.get(d)?.push(p);
  });

  // Pick one from each district first
  const smartMix: Property[] = [];
  const districts = Array.from(districtGroups.keys());
  const maxPerDistrict = Math.max(...Array.from(districtGroups.values()).map(g => g.length));

  for (let i = 0; i < maxPerDistrict; i++) {
    for (const district of districts) {
      const group = districtGroups.get(district);
      if (group && group[i]) {
        smartMix.push(group[i]);
      }
    }
  }

  // Take the top 9 for initial display
  const featuredProperties = smartMix.slice(0, 9);
  return (
    <main className="min-h-screen">
      {/* Homepage JSON-LD Schema */}
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://landforsaleinabuja.ng/#website",
              "url": "https://landforsaleinabuja.ng",
              "name": "LandForSaleInAbuja.ng",
              "description": "Find verified land for sale in Abuja. Browse listings in Maitama, Asokoro, Guzape, Lugbe, and more.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://landforsaleinabuja.ng/buy?keyword={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "RealEstateAgent",
              "@id": "https://landforsaleinabuja.ng/#organization",
              "name": "LandForSaleInAbuja.ng",
              "url": "https://landforsaleinabuja.ng",
              "logo": "https://landforsaleinabuja.ng/logo.png",
              "description": "The #1 marketplace for verified land sales in Abuja, Nigeria. Find plots with C of O in Maitama, Guzape, Asokoro, Lugbe, and more.",
              "areaServed": {
                "@type": "City",
                "name": "Abuja",
                "containedInPlace": {
                  "@type": "Country",
                  "name": "Nigeria"
                }
              },
              "sameAs": [
                "https://www.facebook.com/landforsaleinabuja",
                "https://twitter.com/landinabuja"
              ]
            }
          ]
        })}
      </script>
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
            alt="Aerial view of Abuja land"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
          <div className="inline-block bg-secondary/20 backdrop-blur-sm border border-secondary/50 rounded-full px-4 py-1 text-secondary text-sm font-medium mb-2">
            #1 Marketplace for Verified Land in Abuja
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-secondary">Land for Sale in Abuja</span> <br />Build Your Dream Home
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light">
            Secure your future with verified plots in Maitama, Guzape, Lugbe, and more.
            Direct connections to agents. No hidden fees.
          </p>

          {/* Search Bar */}
          <HeroSearchForm />

          <div className="flex items-center justify-center gap-8 text-sm text-gray-300 pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" /> Verified Titles
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" /> Direct to Owner
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" /> Secure Process
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters / Browse by Category */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/buy?maxPrice=10000000" className="group relative">
              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 p-4 rounded-full text-green-600 group-hover:scale-110 transition-transform duration-300">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">Budget Friendly</h3>
                    <p className="text-sm text-gray-500 mb-2">Land under ₦10 Million</p>
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1 uppercase tracking-wide">
                      View Listings <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link href="/buy?payment_plan=true" className="group relative">
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-4 rounded-full text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">Payment Plans</h3>
                    <p className="text-sm text-gray-500 mb-2">Pay in installments</p>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wide">
                      View Listings <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link href="/buy?type=commercial" className="group relative">
              <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-50 p-4 rounded-full text-purple-600 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">Commercial Land</h3>
                    <p className="text-sm text-gray-500 mb-2">For business & plazas</p>
                    <span className="text-xs font-bold text-purple-600 flex items-center gap-1 uppercase tracking-wide">
                      View Listings <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
              <p className="text-gray-600 max-w-xl">
                Hand-picked premium plots with verified C of O titles in Abuja&apos;s most sought-after locations.
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link href="/buy">View All Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <FeaturedListings
            initialProperties={featuredProperties}
            totalCount={count || featuredProperties.length}
          />

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/buy">View All Listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition / Why Invest */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Invest in Abuja Land?</h2>
            <p className="text-lg text-gray-600">
              As Nigeria's capital, Abuja offers political stability, rapid infrastructure growth, and some of the highest real estate appreciation rates in Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">High ROI Potential</h3>
              <p className="text-gray-600 leading-relaxed">
                Districts like Guzape and Katampe have seen land values appreciate by over 15% annually. Secure your wealth in tangible assets.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure & Verified</h3>
              <p className="text-gray-600 leading-relaxed">
                We prioritize listings with Certificate of Occupancy (C of O) and Right of Occupancy (R of O). Avoid scams with our verification guides.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Strategic Location</h3>
              <p className="text-gray-600 leading-relaxed">
                From the luxury of Maitama to the developing potential of Idu and Lugbe, find land that fits your budget and development goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agent CTA Section - "Sell your land faster" */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-16 border border-white/10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-left">
              <div className="inline-block bg-secondary text-primary font-bold px-4 py-1 rounded-full text-sm mb-6">
                For Agents & Owners
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Sell Your Land Faster <br /> with LandForSaleInAbuja.ng
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-xl">
                Get your property in front of thousands of verified buyers, investors, and diaspora Nigerians looking for land in Abuja.
              </p>
              <ul className="space-y-4 mb-8 text-gray-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Dedicated "Area Specialist" Badges</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Premium Listing Placement</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Direct Leads via WhatsApp</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-bold text-lg px-8" asChild>
                  <Link href="/sell">List Your Property</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 text-lg px-8" asChild>
                  <Link href="/agent/dashboard">Agent Dashboard</Link>
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md">
              <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6 border-b pb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Agent Success</div>
                    <div className="text-sm text-green-600">Verified Partner</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Views this week</span>
                    <span className="font-bold text-xl">1,245</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[75%]" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Leads generated</span>
                    <span className="font-bold text-xl">28</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full w-[45%]" />
                  </div>
                  <div className="pt-4 text-center">
                    <p className="text-sm text-gray-500 italic">"I sold 3 plots in Guzape within my first month listing here."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Schema */}
      <section className="py-20 bg-white">
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I verify land title in Abuja?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Visit AGIS (Abuja Geographic Information Systems) with the land documents. They will confirm if the land has a valid C of O or R of O and if there are any encumbrances."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between C of O and R of O?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "C of O (Certificate of Occupancy) is for individuals and grants 99-year lease. R of O (Right of Occupancy) is typically for government allocations and can be converted to C of O."
                }
              },
              {
                "@type": "Question",
                "name": "What are the best areas to buy land in Abuja?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Premium areas include Maitama, Asokoro, and Guzape. For investment, Katampe, Lugbe, and Idu offer high growth potential at lower entry prices."
                }
              },
              {
                "@type": "Question",
                "name": "How much does land cost in Abuja?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Prices vary by location. Lugbe starts from ₦5M per plot, while Maitama can exceed ₦500M. Most middle-class areas like Gwarinpa range from ₦30M-₦80M."
                }
              }
            ]
          })}
        </script>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl border">
              <h3 className="font-bold text-lg mb-2">How do I verify land title in Abuja?</h3>
              <p className="text-gray-600">Visit AGIS (Abuja Geographic Information Systems) with the land documents. They will confirm if the land has a valid C of O or R of O and if there are any encumbrances. <Link href="/blog/how-to-verify-land-title-in-abuja" className="text-primary hover:underline">Read our complete guide →</Link></p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border">
              <h3 className="font-bold text-lg mb-2">What is the difference between C of O and R of O?</h3>
              <p className="text-gray-600">C of O (Certificate of Occupancy) is for individuals and grants 99-year lease. R of O (Right of Occupancy) is typically for government allocations and can be converted to C of O. <Link href="/blog/c-of-o-vs-r-of-o" className="text-primary hover:underline">Learn more →</Link></p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border">
              <h3 className="font-bold text-lg mb-2">What are the best areas to buy land in Abuja?</h3>
              <p className="text-gray-600">Premium areas include <Link href="/buy/maitama" className="text-primary hover:underline">Maitama</Link>, <Link href="/buy/asokoro" className="text-primary hover:underline">Asokoro</Link>, and <Link href="/buy/guzape" className="text-primary hover:underline">Guzape</Link>. For investment, <Link href="/buy/katampe" className="text-primary hover:underline">Katampe</Link>, <Link href="/buy/lugbe" className="text-primary hover:underline">Lugbe</Link>, and <Link href="/buy/idu" className="text-primary hover:underline">Idu</Link> offer high growth potential at lower entry prices.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border">
              <h3 className="font-bold text-lg mb-2">How much does land cost in Abuja?</h3>
              <p className="text-gray-600">Prices vary by location. Lugbe starts from ₦5M per plot, while Maitama can exceed ₦500M. Most middle-class areas like Gwarinpa range from ₦30M-₦80M. <Link href="/buy" className="text-primary hover:underline">Browse all listings →</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content / Popular Areas */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Popular Areas for Land in Abuja</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Maitama', 'Asokoro', 'Guzape', 'Wuse II', 'Gwarinpa', 'Lugbe', 'Katampe', 'Idu'].map((area) => (
              <Link
                key={area}
                href={`/buy/${area.toLowerCase()}`}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md border text-center hover:border-primary transition-all group"
              >
                <h3 className="font-bold text-gray-800 group-hover:text-primary">{area}</h3>
                <p className="text-xs text-gray-500 mt-1">View Listings</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

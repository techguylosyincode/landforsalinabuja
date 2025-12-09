"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, CheckCircle, TrendingUp, ShieldCheck, Users, ArrowRight } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

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

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) {
        const mappedProps: Property[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          district: p.district,
          size: p.size,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
          titleType: p.title_type,
          slug: p.slug || p.id
        }));
        setFeaturedProperties(mappedProps);
      }
    };

    fetchProperties();
  }, []);
  return (
    <main className="min-h-screen">
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
            Build Your Dream <br /> in <span className="text-secondary">Abuja's</span> Prime Districts
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light">
            Secure your future with verified plots in Maitama, Guzape, Lugbe, and more.
            Direct connections to agents. No hidden fees.
          </p>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 max-w-4xl mx-auto shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-300 group-focus-within:text-secondary transition-colors" />
                <input
                  type="text"
                  placeholder="Where do you want to buy? (e.g., Guzape)"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white/20 transition-all"
                />
              </div>
              <div className="w-full md:w-48 relative group">
                <TrendingUp className="absolute left-4 top-3.5 h-5 w-5 text-gray-300 group-focus-within:text-secondary transition-colors" />
                <input
                  type="number"
                  placeholder="Max Price (₦)"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white/20 transition-all"
                />
              </div>
              <Button size="lg" className="md:w-auto w-full h-auto py-3 text-lg font-bold bg-secondary text-primary hover:bg-secondary/90 shadow-lg hover:shadow-secondary/20">
                <Search className="mr-2 h-5 w-5" /> Search Land
              </Button>
            </div>
          </div>

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

      {/* Featured Listings Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
              <p className="text-gray-600 max-w-xl">
                Hand-picked premium plots with verified C of O titles in Abuja's most sought-after locations.
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link href="/buy">View All Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

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

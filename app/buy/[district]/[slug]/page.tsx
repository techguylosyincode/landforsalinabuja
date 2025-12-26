import { Button } from "@/components/ui/button";
import { MapPin, Ruler, CheckCircle, Phone, MessageSquare, BookOpen, Shield, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProfileData = {
  full_name: string | null;
  phone_number: string | null;
  agency_name: string | null;
  is_verified: boolean | null;
};

type Property = {
  id: string;
  title: string;
  price: number;
  district: string;
  address: string;
  size_sqm: number;
  description: string;
  images: string[];
  title_type: string;
  features: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  profiles?: ProfileData | null;
  slug: string;
};

type RelatedProperty = {
  id: string;
  title: string;
  price: number;
  size_sqm: number;
  images: string[];
  slug: string;
  district: string;
};

export const revalidate = 300;

async function fetchRelatedProperties(district: string, excludeId: string): Promise<RelatedProperty[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('properties')
      .select('id, title, price, size_sqm, images, slug, district')
      .eq('district', district)
      .eq('status', 'active')
      .neq('id', excludeId)
      .limit(3);
    return data || [];
  } catch {
    return [];
  }
}

async function fetchProperty(slug: string): Promise<Property | null> {
  try {
    const supabase = await createClient();
    const slugBase = slug.replace(/-[0-9]+$/, ""); // strip numeric suffix if present
    const slug60 = slugBase.slice(0, 60);
    const slug40 = slugBase.slice(0, 40);
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(slug);

    const primaryClauses = [`slug.eq.${slug}`];
    if (isUuid) primaryClauses.push(`id.eq.${slug}`);

    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, title, price, district, address, size_sqm, description, images, title_type, features, meta_title, meta_description, slug, profiles (full_name, phone_number, agency_name, is_verified)"
      )
      .or(primaryClauses.join(","))
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("fetchProperty primary error:", error);
      }
      // Try stripped slug prefix (covers truncated slugs in DB)
      const fallbackClauses = [
        `slug.eq.${slugBase}`,
        `slug.ilike.${slugBase}%`,
        `slug.ilike.${slug60}%`,
        `slug.ilike.${slug40}%`,
      ];
      if (isUuid) {
        fallbackClauses.push(`id.eq.${slugBase}`, `id.eq.${slug60}`);
      }

      const { data: alt, error: altError } = await supabase
        .from("properties")
        .select(
          "id, title, price, district, address, size_sqm, description, images, title_type, features, meta_title, meta_description, slug, profiles (full_name, phone_number, agency_name, is_verified)"
        )
        .or(fallbackClauses.join(","))
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (altError) {
        console.error("fetchProperty fallback error:", altError);
        return null;
      }

      if (!alt) return null;

      // Handle profiles - Supabase returns array for joins
      const profileData = Array.isArray(alt.profiles) ? alt.profiles[0] : alt.profiles;
      return { ...alt, profiles: profileData || null } as Property;
    }

    // Handle profiles - Supabase returns array for joins
    const profileData = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    return { ...data, profiles: profileData || null } as Property;
  } catch (e) {
    console.error("fetchProperty error:", e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; district: string }> }) {
  try {
    const { slug, district } = await params;
    const property = await fetchProperty(decodeURIComponent(slug || ""));
    if (!property) return {};
    const title = property.meta_title || `${property.title} | LandForSaleInAbuja.ng`;
    const desc =
      property.meta_description ||
      `${property.title} - ${property.size_sqm}sqm in ${district}. ${property.description?.slice(0, 150)}`;
    return {
      title,
      description: desc,
    };
  } catch {
    return {};
  }
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ district: string; slug: string }> }) {
  try {
    const { slug, district } = await params;
    const property = await fetchProperty(decodeURIComponent(slug || ""));
    if (!property) notFound();

    // Fetch related properties in the same district
    const relatedProperties = await fetchRelatedProperties(district, property.id);

    const agent = property.profiles
      ? {
        name: property.profiles.full_name || "Agent",
        phone: property.profiles.phone_number || "",
        agency: property.profiles.agency_name || "Independent Agent",
        verified: property.profiles.is_verified || false,
      }
      : null;

    const image =
      property.images?.[0] ||
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop";
    const ldJson = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: property.title,
      description: property.description,
      url: `https://landforsaleinabuja.ng/buy/${property.district}/${property.slug}`,
      datePosted: new Date().toISOString(),
      image: image,
      offers: {
        "@type": "Offer",
        price: property.price,
        priceCurrency: "NGN",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "RealEstateAgent",
          name: agent?.agency || "LandForSaleInAbuja.ng",
          telephone: agent?.phone || "",
        },
      },
      about: {
        "@type": "Place",
        name: `${property.district}, Abuja`,
        address: {
          "@type": "PostalAddress",
          addressLocality: property.district,
          addressRegion: "FCT",
          addressCountry: "NG",
        },
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Plot Size",
          value: `${property.size_sqm} sqm`,
        },
        {
          "@type": "PropertyValue",
          name: "Title Type",
          value: property.title_type,
        },
      ],
    };

    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify(ldJson)}
        </script>
        <div className="container mx-auto px-4">
          <div className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>{" "}
            &gt;{" "}
            <Link href="/buy" className="hover:text-primary">
              Buy
            </Link>{" "}
            &gt; <span className="capitalize">{district}</span> &gt;{" "}
            <span className="text-gray-900">{property.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image */}
              <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-gray-200">
                <Image src={image} alt={property.title} fill className="object-cover" priority />
              </div>

              {/* Details */}
              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.address}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-3xl font-bold text-primary">
                    NGN {property.price?.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y mb-6">
                  <div>
                    <div className="text-sm text-gray-500">Size</div>
                    <div className="font-bold flex items-center">
                      <Ruler className="w-4 h-4 mr-1 text-secondary" />
                      {property.size_sqm} sqm
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Title</div>
                    <div className="font-bold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      {property.title_type}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Use</div>
                    <div className="font-bold">Residential</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-bold text-green-600 capitalize">{property.features?.[0] || "Active"}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold text-lg mb-4">Contact Agent</h3>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-500">{agent?.name?.charAt(0) || "A"}</span>
                  </div>
                  <div>
                    <div className="font-bold">{agent?.name || "Agent"}</div>
                    <div className="text-sm text-gray-500">{agent?.agency}</div>
                    {agent?.verified && (
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified Agent
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {agent?.phone && (
                    <>
                      <a href={`tel:${agent.phone}`} className="block">
                        <Button className="w-full flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" /> Call Agent
                        </Button>
                      </a>
                      <a
                        href={`https://wa.me/234${agent.phone.replace(/^0/, '')}?text=Hello, I am interested in: ${property.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" /> WhatsApp
                        </Button>
                      </a>
                      <p className="text-center text-sm text-gray-500 mt-2">
                        📞 {agent.phone}
                      </p>
                    </>
                  )}
                  {!agent?.phone && (
                    <p className="text-center text-sm text-gray-500">
                      Contact info not available
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Safety Tips</h3>
                <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                  <li>Always inspect the land in person.</li>
                  <li>Verify documents at AGIS.</li>
                  <li>Do not pay before inspection.</li>
                  <li>Meet in a public place.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Helpful Resources - Internal Links to Blog Posts */}
          <div className="mt-12 bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Helpful Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/blog/how-to-verify-land-title-in-abuja" className="group p-4 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="flex items-start gap-3">
                  <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">How to Verify Land Title</h3>
                    <p className="text-sm text-gray-600 mt-1">Complete guide to verifying land documents at AGIS before purchase.</p>
                  </div>
                </div>
              </Link>
              <Link href="/blog/c-of-o-vs-r-of-o" className="group p-4 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="flex items-start gap-3">
                  <FileText className="w-8 h-8 text-secondary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">C of O vs R of O Explained</h3>
                    <p className="text-sm text-gray-600 mt-1">Understanding the difference between title types in Abuja.</p>
                  </div>
                </div>
              </Link>
              <Link href="/blog/land-scams-in-abuja-protection-guide" className="group p-4 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="flex items-start gap-3">
                  <Shield className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">Avoid Land Scams</h3>
                    <p className="text-sm text-gray-600 mt-1">Protect yourself from common real estate fraud in Abuja.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Related Properties */}
          {relatedProperties.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Similar Properties in {district.charAt(0).toUpperCase() + district.slice(1)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProperties.map((related) => (
                  <Link
                    key={related.id}
                    href={`/buy/${related.district}/${related.slug}`}
                    className="group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48 bg-gray-200">
                      <Image
                        src={related.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400"}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-primary font-bold">₦{related.price?.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">{related.size_sqm} sqm</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link href={`/buy/${district}`} className="text-primary hover:underline font-medium">
                  View all properties in {district.charAt(0).toUpperCase() + district.slice(1)} →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  } catch (e) {
    console.error("PropertyDetailsPage error:", e);
    notFound();
  }
}

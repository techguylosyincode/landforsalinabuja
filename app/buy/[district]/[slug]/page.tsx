import { Button } from "@/components/ui/button";
import { MapPin, Ruler, CheckCircle, Phone, MessageSquare } from "lucide-react";
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

export const revalidate = 300;

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
      "@type": "Offer",
      name: property.title,
      description: property.description,
      price: property.price,
      priceCurrency: "NGN",
      itemOffered: {
        "@type": "Product",
        name: `${property.title} - ${property.size_sqm}sqm in ${property.district}`,
      },
      url: `https://landforsaleinabuja.ng/buy/${property.district}/${property.slug}`,
      areaServed: property.district,
      category: "Land",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: agent?.agency || "Agent",
        telephone: agent?.phone || "",
      },
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
                  <Button className="w-full flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Call Agent
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </Button>
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
        </div>
      </main>
    );
  } catch (e) {
    console.error("PropertyDetailsPage error:", e);
    notFound();
  }
}

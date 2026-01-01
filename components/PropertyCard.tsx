import Link from "next/link";
import Image from "next/image";
import { MapPin, Ruler, CheckCircle, MessageCircle, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyProps {
    id: string;
    title: string;
    price: number;
    district: string;
    size: number;
    image: string;
    titleType: string;
    slug: string;
    // Optional agent data for WhatsApp
    agentPhone?: string | null;
    agentVerified?: boolean;
    // Featured listing data
    is_featured?: boolean;
    featured_until?: string | null;
}

// Helper to format phone number for WhatsApp
function formatWhatsAppNumber(phone: string): string {
    // Remove leading 0 and add Nigeria country code
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        return '234' + cleaned.slice(1);
    }
    if (cleaned.startsWith('234')) {
        return cleaned;
    }
    return '234' + cleaned;
}

export default function PropertyCard({ property }: { property: PropertyProps }) {
    const whatsappMessage = encodeURIComponent(
        `Hi, I'm interested in this property: ${property.title} in ${property.district}. Is it still available?`
    );

    const whatsappUrl = property.agentPhone
        ? `https://wa.me/${formatWhatsAppNumber(property.agentPhone)}?text=${whatsappMessage}`
        : null;

    return (
        <div className="group bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
                <Image
                    src={property.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Title Type Badge */}
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {property.titleType}
                </div>
                {/* Verified Agent Badge */}
                {property.agentVerified && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                    </div>
                )}
                {/* Featured Badge */}
                {property.is_featured && property.featured_until && new Date(property.featured_until) > new Date() && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg z-10">
                        <Zap className="w-3 h-3 mr-1 fill-white" />
                        FEATURED
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.district}
                </div>

                <Link href={`/buy/${property.district.toLowerCase()}/${property.slug}`}>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {property.title}
                    </h3>
                </Link>

                <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-xl text-primary">
                        ₦{property.price.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Ruler className="w-4 h-4 mr-1" />
                        {property.size} sqm
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" asChild>
                        <Link href={`/buy/${property.district.toLowerCase()}/${property.slug}`}>
                            View Details
                        </Link>
                    </Button>
                    {whatsappUrl ? (
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            asChild
                        >
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1"
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                            </a>
                        </Button>
                    ) : (
                        <Button className="flex-1" asChild>
                            <Link href={`/buy/${property.district.toLowerCase()}/${property.slug}`}>
                                Contact
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

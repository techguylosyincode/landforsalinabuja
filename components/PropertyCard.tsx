import Link from "next/link";
import Image from "next/image";
import { MapPin, Ruler, CheckCircle } from "lucide-react";
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
}

export default function PropertyCard({ property }: { property: PropertyProps }) {
    return (
        <div className="group bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
                <Image
                    src={property.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {property.titleType}
                </div>
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
                    <Button className="w-full" variant="outline" asChild>
                        <Link href={`/buy/${property.district.toLowerCase()}/${property.slug}`}>
                            View Details
                        </Link>
                    </Button>
                    <Button className="w-full">
                        Contact Agent
                    </Button>
                </div>
            </div>
        </div>
    );
}

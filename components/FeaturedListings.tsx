"use client";

import { useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

interface FeaturedListingsProps {
    initialProperties: Property[];
    totalCount: number;
}

export default function FeaturedListings({ initialProperties, totalCount }: FeaturedListingsProps) {
    const [properties, setProperties] = useState<Property[]>(initialProperties);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    const hasMore = properties.length < totalCount;

    const loadMore = async () => {
        setLoading(true);
        try {
            const nextPage = page + 1;
            const response = await fetch(`/api/properties?page=${nextPage}&limit=${ITEMS_PER_PAGE}`);
            const data = await response.json();

            if (data.properties && data.properties.length > 0) {
                setProperties([...properties, ...data.properties]);
                setPage(nextPage);
            }
        } catch (error) {
            console.error("Error loading more properties:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>

            {hasMore && (
                <div className="mt-12 text-center">
                    <Button
                        onClick={loadMore}
                        disabled={loading}
                        size="lg"
                        className="min-w-[200px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            `Load More Properties (${properties.length}/${totalCount})`
                        )}
                    </Button>
                </div>
            )}

            {!hasMore && properties.length > 9 && (
                <div className="mt-8 text-center text-gray-500">
                    Showing all {properties.length} properties
                </div>
            )}
        </div>
    );
}

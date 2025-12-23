"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PropertyCard from "@/components/PropertyCard";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Define Property type
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

// Districts list
const DISTRICTS = [
    "All Districts",
    "Maitama", "Asokoro", "Guzape", "Wuse II", "Gwarinpa",
    "Lugbe", "Katampe", "Idu", "Jabi", "Wuye", "Utako",
    "Garki", "Kubwa", "Kuje", "Dei-Dei", "Karmo", "Life Camp",
];

// Title types
const TITLE_TYPES = [
    { value: "", label: "All Title Types" },
    { value: "C_of_O", label: "C of O" },
    { value: "R_of_O", label: "R of O" },
    { value: "Allocation", label: "Allocation" },
    { value: "Other", label: "Other" },
];

// Price ranges
const PRICE_RANGES = [
    { value: "", label: "Any Price" },
    { value: "0-10000000", label: "Under ₦10M" },
    { value: "10000000-30000000", label: "₦10M - ₦30M" },
    { value: "30000000-50000000", label: "₦30M - ₦50M" },
    { value: "50000000-100000000", label: "₦50M - ₦100M" },
    { value: "100000000-999999999999", label: "Above ₦100M" },
];

interface BuyPageClientProps {
    initialProperties: Property[];
    initialSearchTerm: string;
    initialDistrict: string;
    initialTitleType: string;
    initialPriceRange: string;
    initialMinPrice: string;
    initialMaxPrice: string;
    initialMinSize: string;
    initialMaxSize: string;
}

export default function BuyPageClient({
    initialProperties,
    initialSearchTerm,
    initialDistrict,
    initialTitleType,
    initialPriceRange,
    initialMinPrice,
    initialMaxPrice,
    initialMinSize,
    initialMaxSize,
}: BuyPageClientProps) {
    const router = useRouter();
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
    const [selectedTitleType, setSelectedTitleType] = useState(initialTitleType);
    const [priceRange, setPriceRange] = useState(initialPriceRange);
    const [minPrice, setMinPrice] = useState(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
    const [minSize, setMinSize] = useState(initialMinSize);
    const [maxSize, setMaxSize] = useState(initialMaxSize);

    // Apply filters by navigating to new URL
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        if (selectedDistrict) params.set("district", selectedDistrict);
        if (selectedTitleType) params.set("titleType", selectedTitleType);
        if (priceRange) params.set("priceRange", priceRange);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (minSize) params.set("minSize", minSize);
        if (maxSize) params.set("maxSize", maxSize);

        const queryString = params.toString();
        router.push(queryString ? `/buy?${queryString}` : "/buy");
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedDistrict("");
        setSelectedTitleType("");
        setPriceRange("");
        setMinPrice("");
        setMaxPrice("");
        setMinSize("");
        setMaxSize("");
        router.push("/buy");
    };

    // Handle search on Enter key
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    // Check if any filters are active
    const hasActiveFilters = initialSearchTerm || initialDistrict || initialTitleType ||
        initialPriceRange || initialMinPrice || initialMaxPrice ||
        initialMinSize || initialMaxSize;

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Land for Sale in Abuja</h1>
                        <p className="text-gray-600 text-sm mt-1">
                            {initialProperties.length} properties found
                        </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search properties..."
                                className="pl-9 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                        </div>
                        <Button onClick={applyFilters}>
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            className="gap-2"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="bg-white text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                                    !
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Filter Properties</h3>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                                    <X className="h-4 w-4 mr-1" /> Clear All
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* District */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {DISTRICTS.map((district) => (
                                        <option key={district} value={district === "All Districts" ? "" : district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Title Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title Type</label>
                                <select
                                    value={selectedTitleType}
                                    onChange={(e) => setSelectedTitleType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {TITLE_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                                <select
                                    value={priceRange}
                                    onChange={(e) => {
                                        setPriceRange(e.target.value);
                                        if (e.target.value) {
                                            setMinPrice("");
                                            setMaxPrice("");
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {PRICE_RANGES.map((range) => (
                                        <option key={range.value} value={range.value}>
                                            {range.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Size Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Size (sqm)</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={minSize}
                                        onChange={(e) => setMinSize(e.target.value)}
                                        className="bg-white"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={maxSize}
                                        onChange={(e) => setMaxSize(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom Price + Apply Button */}
                        <div className="mt-4 pt-4 border-t flex flex-wrap items-end gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Price (₦)</label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => {
                                            setMinPrice(e.target.value);
                                            setPriceRange("");
                                        }}
                                        className="bg-white w-32"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => {
                                            setMaxPrice(e.target.value);
                                            setPriceRange("");
                                        }}
                                        className="bg-white w-32"
                                    />
                                </div>
                            </div>
                            <Button onClick={applyFilters} className="ml-auto">
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Active Filter Pills */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {initialSearchTerm && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                Search: {initialSearchTerm}
                            </span>
                        )}
                        {initialDistrict && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                {initialDistrict}
                            </span>
                        )}
                        {initialTitleType && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                {TITLE_TYPES.find(t => t.value === initialTitleType)?.label}
                            </span>
                        )}
                        {(initialPriceRange || initialMinPrice || initialMaxPrice) && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                Price: {initialPriceRange ? PRICE_RANGES.find(r => r.value === initialPriceRange)?.label : `₦${initialMinPrice || 0} - ₦${initialMaxPrice || "∞"}`}
                            </span>
                        )}
                        {(initialMinSize || initialMaxSize) && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                Size: {initialMinSize || 0} - {initialMaxSize || "∞"} sqm
                            </span>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 h-7">
                            <X className="h-3 w-3 mr-1" /> Clear
                        </Button>
                    </div>
                )}

                {/* Results */}
                {initialProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initialProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg border">
                        <div className="text-gray-400 mb-4">
                            <Search className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or search term.</p>
                        <Button onClick={clearFilters}>Clear All Filters</Button>
                    </div>
                )}
            </div>
        </main>
    );
}

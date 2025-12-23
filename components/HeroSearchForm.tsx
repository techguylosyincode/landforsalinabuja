"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, Search } from "lucide-react";

export default function HeroSearchForm() {
    const router = useRouter();
    const [location, setLocation] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (location) params.set("q", location);
        if (maxPrice) params.set("maxPrice", maxPrice);

        const queryString = params.toString();
        router.push(queryString ? `/buy?${queryString}` : "/buy");
    };

    return (
        <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 max-w-4xl mx-auto shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-300 group-focus-within:text-secondary transition-colors" />
                    <input
                        type="text"
                        placeholder="Where do you want to buy? (e.g., Guzape)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white/20 transition-all"
                    />
                </div>
                <div className="w-full md:w-48 relative group">
                    <TrendingUp className="absolute left-4 top-3.5 h-5 w-5 text-gray-300 group-focus-within:text-secondary transition-colors" />
                    <input
                        type="number"
                        placeholder="Max Price (₦)"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white/20 transition-all"
                    />
                </div>
                <Button
                    type="submit"
                    size="lg"
                    className="md:w-auto w-full h-auto py-3 text-lg font-bold bg-secondary text-primary hover:bg-secondary/90 shadow-lg hover:shadow-secondary/20"
                >
                    <Search className="mr-2 h-5 w-5" /> Search Land
                </Button>
            </div>
        </form>
    );
}

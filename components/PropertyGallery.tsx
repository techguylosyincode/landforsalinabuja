"use client";

import { useState } from "react";
import Image from "next/image";

interface PropertyGalleryProps {
    images: string[];
    title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
    // Ensure we have at least one image or a fallback
    const allImages = images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"];

    const [selectedImage, setSelectedImage] = useState(allImages[0]);

    return (
        <div className="space-y-4">
            {/* Main Large Image */}
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-gray-200">
                <Image
                    src={selectedImage}
                    alt={title}
                    fill
                    className="object-cover transition-all duration-500 ease-in-out"
                    priority
                />
            </div>

            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {allImages.map((img, index) => (
                        <div
                            key={index}
                            className={`relative h-24 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-all ${selectedImage === img ? "ring-2 ring-primary ring-offset-2" : ""
                                }`}
                            onClick={() => setSelectedImage(img)}
                        >
                            <Image
                                src={img}
                                alt={`${title} ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

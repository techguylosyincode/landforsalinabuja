"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Upload, AlertCircle, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";

export default function AddListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        district: "",
        address: "",
        size: "",
        title_type: "C_of_O",
        image_url: "",
        features: "", // Comma separated
        meta_title: "",
        meta_description: "",
        focus_keyword: "",
        is_featured: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        setError(null);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const supabase = createClient();
            const { error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } catch (err: any) {
            console.error("Upload error:", err);
            setError("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("You must be logged in to post a property.");
                setTimeout(() => router.push("/login"), 2000);
                return;
            }

            // Process features
            const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f !== "");

            // Insert property
            const { error: insertError } = await supabase.from("properties").insert({
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                district: formData.district,
                address: formData.address,
                size_sqm: parseFloat(formData.size),
                title_type: formData.title_type,
                images: [formData.image_url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"],
                agent_id: user.id,
                slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
                status: "active",
                features: featuresArray,
                meta_title: formData.meta_title || formData.title,
                meta_description: formData.meta_description || formData.description.substring(0, 150),
                focus_keyword: formData.focus_keyword,
                is_featured: formData.is_featured
            });

            if (insertError) {
                throw insertError;
            }

            alert("Property listed successfully!");
            router.push("/agent/dashboard");
            router.refresh();
        } catch (err: any) {
            console.error("Error creating listing:", err);
            setError(err.message || "Failed to create listing. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/agent/dashboard" className="inline-flex items-center text-gray-500 hover:text-primary mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-xl shadow-sm border p-8">
                    <h1 className="text-2xl font-bold mb-6">Post a New Property</h1>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                                <Input
                                    name="title"
                                    placeholder="e.g. Prime Land in Guzape"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                                    Pin this listing (Featured)
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    className="w-full rounded-md border border-gray-200 p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Describe the property..."
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                                    <Input
                                        name="price"
                                        type="number"
                                        placeholder="e.g. 50000000"
                                        required
                                        value={formData.price}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Size (sqm)</label>
                                    <Input
                                        name="size"
                                        type="number"
                                        placeholder="e.g. 600"
                                        required
                                        value={formData.size}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                    <select
                                        name="district"
                                        className="w-full rounded-md border border-gray-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.district}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select District</option>
                                        <option value="Guzape">Guzape</option>
                                        <option value="Maitama">Maitama</option>
                                        <option value="Asokoro">Asokoro</option>
                                        <option value="Wuse">Wuse</option>
                                        <option value="Lugbe">Lugbe</option>
                                        <option value="Idu">Idu</option>
                                        <option value="Katampe">Katampe</option>
                                        <option value="Jahi">Jahi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title Type</label>
                                    <select
                                        name="title_type"
                                        className="w-full rounded-md border border-gray-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.title_type}
                                        onChange={handleChange}
                                    >
                                        <option value="C_of_O">C of O</option>
                                        <option value="R_of_O">R of O</option>
                                        <option value="Allocation">Allocation</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <Input
                                    name="address"
                                    placeholder="e.g. Plot 123, Diplomatic Zone"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-2">Property Image</h2>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                                {formData.image_url ? (
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                        <Image
                                            src={formData.image_url}
                                            alt="Property preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image_url: "" })}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                                </>
                                            ) : (
                                                "Select Image"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features & SEO Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-2">Features & SEO</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Features (Comma separated)</label>
                                <Input
                                    name="features"
                                    placeholder="e.g. Fenced, Tarred Road, Electricity, Borehole"
                                    value={formData.features}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keyword</label>
                                    <Input
                                        name="focus_keyword"
                                        placeholder="e.g. Land for sale in Guzape"
                                        value={formData.focus_keyword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                    <Input
                                        name="meta_title"
                                        placeholder="Custom SEO Title (optional)"
                                        value={formData.meta_title}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                <textarea
                                    name="meta_description"
                                    className="w-full rounded-md border border-gray-200 p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Custom SEO Description (optional)"
                                    value={formData.meta_description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading || uploading}>
                            {loading ? "Creating Listing..." : "Post Property"}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}

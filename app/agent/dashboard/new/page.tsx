"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Upload, AlertCircle, X, Loader2, Sparkles, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import ListingQuotaDisplay from "@/components/ListingQuotaDisplay";
import { LISTING_LIMITS } from "@/lib/constants/subscription";
import { getFeaturedLimit, canFeatureListing, rotateFeatureListing, getFeaturedUntilDate } from "@/lib/utils/featured";

export default function AddListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [activeListingsCount, setActiveListingsCount] = useState(0);
    const [canFeature, setCanFeature] = useState(false);
    const [wantsFeatured, setWantsFeatured] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dropdown Data
    const [locations, setLocations] = useState<{ id: string, name: string }[]>([]);
    const [landTypes, setLandTypes] = useState<{ id: string, name: string }[]>([]);
    const [estates, setEstates] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            setOptionsLoading(true);

            try {
                // Fetch User & Premium Status
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase.from('profiles').select('subscription_tier, subscription_expiry, verification_status, is_verified, role').eq('id', user.id).single();

                    if (data) {
                        setProfile(data);
                    }

                    // Treat expired as starter in the UI
                    const expiry = data?.subscription_expiry ? new Date(data.subscription_expiry) : null;
                    const effectiveTier = expiry && expiry.getTime() < Date.now() ? 'starter' : data?.subscription_tier;

                    if (effectiveTier === 'premium' || effectiveTier === 'pro' || effectiveTier === 'agency') {
                        setIsPremium(true);
                    } else {
                        setIsPremium(false);
                    }

                    // Check if user can feature listings
                    const featuredLimit = getFeaturedLimit(effectiveTier || 'starter');
                    setCanFeature(featuredLimit > 0);

                    if (data?.verification_status === "verified" || data?.is_verified) {
                        setIsVerified(true);
                    } else {
                        setIsVerified(false);
                    }

                    // Fetch active listings count
                    const { data: propertiesData } = await supabase
                        .from('properties')
                        .select('id', { count: 'exact', head: true })
                        .eq('agent_id', user.id)
                        .eq('status', 'active');

                    if (propertiesData) {
                        setActiveListingsCount(propertiesData.length || 0);
                    }
                }

                // Fetch Dropdowns
                const { data: locs } = await supabase.from('locations').select('id, name').order('name');
                const { data: types } = await supabase.from('land_types').select('id, name').order('name');
                const { data: ests } = await supabase.from('estates').select('id, name').order('name');

                if (locs) setLocations(locs);
                if (types) setLandTypes(types);
                if (ests) setEstates(ests);
            } catch (err) {
                console.error("Error loading dropdown data", err);
            } finally {
                setOptionsLoading(false);
            }
        };
        fetchData();
    }, []);

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        location_id: "",
        land_type_id: "",
        estate_id: "",
        address: "",
        size: "",
        slug: "",
        title_type: "C_of_O",
        images: [] as string[],
        features: "", // Comma separated
        description: "",
        meta_title: "",
        meta_description: "",
        focus_keyword: "",
        is_featured: false,
        is_distressed: false,
        has_foundation: false
    });

    // Auto-generate SEO fields when key fields change
    const generateSeoSuggestions = useCallback(() => {
        const locationName = locations.find(l => l.id === formData.location_id)?.name || "";
        const typeName = landTypes.find(t => t.id === formData.land_type_id)?.name || "Land";
        const estateName = formData.estate_id ? estates.find(e => e.id === formData.estate_id)?.name : "";
        const size = formData.size;
        const price = formData.price ? `₦${parseInt(formData.price).toLocaleString()}` : "";
        const titleTypeText = formData.title_type === 'C_of_O' ? 'C of O available' : formData.title_type === 'R_of_O' ? 'R of O available' : '';

        if (!locationName || !size) return;

        // Generate focus keyword
        const suggestedKeyword = estateName
            ? `${typeName.toLowerCase()} for sale in ${estateName} ${locationName}`
            : `${typeName.toLowerCase()} for sale in ${locationName} Abuja`;

        // Generate meta title (max 60 chars)
        const suggestedTitle = estateName
            ? `${size}sqm ${typeName} in ${estateName}, ${locationName} | Buy Now`
            : `${size}sqm ${typeName} for Sale in ${locationName}, Abuja`;

        // Generate meta description (max 160 chars)
        const suggestedDesc = `Buy ${size}sqm ${typeName.toLowerCase()} in ${locationName}, Abuja${estateName ? ` (${estateName})` : ''}. ${price ? `Price: ${price}.` : ''} ${titleTypeText ? titleTypeText + '.' : ''} Contact verified agent now.`;

        // Generate description
        const suggestedDescription = `${size}sqm ${typeName.toLowerCase()} available for sale in ${locationName}, Abuja${estateName ? ` within ${estateName}` : ''}. ${formData.address ? `Located at ${formData.address}.` : ''} ${titleTypeText ? `This property comes with ${titleTypeText}.` : ''} ${formData.features ? `Features include: ${formData.features}.` : ''} Contact agent for inspection and more details.`;

        setFormData(prev => ({
            ...prev,
            focus_keyword: prev.focus_keyword || suggestedKeyword,
            meta_title: prev.meta_title || suggestedTitle.substring(0, 60),
            meta_description: prev.meta_description || suggestedDesc.substring(0, 160),
            description: prev.description || suggestedDescription
        }));
    }, [locations, landTypes, estates, formData.location_id, formData.land_type_id, formData.estate_id, formData.size, formData.price, formData.title_type, formData.address, formData.features]);

    const handleGenerateClick = () => {
        // Ensure required fields exist before attempting auto-fill
        if (!formData.location_id || !formData.land_type_id || !formData.size) {
            setError("Select a location, land type, and enter size before auto-generating SEO.");
            return;
        }
        setError(null);
        generateSeoSuggestions();
    };

    // Auto-fill SEO when key fields are available
    useEffect(() => {
        if (formData.location_id && formData.land_type_id && formData.size) {
            generateSeoSuggestions();
        }
    }, [formData.location_id, formData.land_type_id, formData.size, generateSeoSuggestions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkboxes
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        setError(null);
        const files = Array.from(e.target.files);

        // Basic client-side checks
        const MAX_SIZE_MB = 3;
        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                setError("Please upload image files (jpg, png, webp).");
                setUploading(false);
                return;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setError(`Image ${file.name} is too large. Max size is ${MAX_SIZE_MB}MB.`);
                setUploading(false);
                return;
            }
        }

        const supabase = createClient();
        const uploaded: string[] = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
                const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitizedName || `upload.${fileExt}`}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(filePath);
                uploaded.push(publicUrl);
            }

            setFormData(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
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
        // Safety: force-stop spinner after 20s if something hangs
        const timeout = setTimeout(() => {
            setLoading(false);
            setError((prev) => prev || "Request is taking too long. Please check your connection and try again.");
        }, 20000);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in to post a property.");
            setLoading(false);
            return;
        }

        if (!formData.location_id) {
            setError("Please select a location.");
            setLoading(false);
            return;
        }

        if (!formData.land_type_id) {
            setError("Please select a land type.");
            setLoading(false);
            return;
        }

        // Basic client-side sanity checks
        if (!formData.images || formData.images.length === 0) {
            setError("Please upload at least one property photo.");
            setLoading(false);
            return;
        }

        const priceValue = parseFloat(formData.price);
        const sizeValue = parseFloat(formData.size);
        if (Number.isNaN(priceValue) || priceValue <= 0) {
            setError("Price must be a positive number.");
            setLoading(false);
            return;
        }
        if (Number.isNaN(sizeValue) || sizeValue <= 0) {
            setError("Size must be a positive number.");
            setLoading(false);
            return;
        }
        if (!formData.description || formData.description.trim().length < 40) {
            setError("Please add a short description (at least 40 characters).");
            setLoading(false);
            return;
        }

            // 1. Check Limits & Set Status (respect expiry)
            const { data: profileData } = await supabase.from('profiles').select('subscription_tier, subscription_expiry').eq('id', user.id).single();
            const expiry = profileData?.subscription_expiry ? new Date(profileData.subscription_expiry) : null;
            const tier = expiry && expiry.getTime() < Date.now() ? 'starter' : (profileData?.subscription_tier || 'starter');

            const limit = LISTING_LIMITS[tier as keyof typeof LISTING_LIMITS] ?? 1;
            const isPaid = tier === 'premium' || tier === 'pro' || tier === 'agency';

            // Handle featured listing
            let isFeatured = false;
            let featuredUntil = null;

            if (wantsFeatured && canFeature) {
                // Check if user can feature (double-check limit)
                const canFeatureNow = await canFeatureListing(user.id, tier);

                if (canFeatureNow) {
                    // Rotate old featured listings for pro tier
                    await rotateFeatureListing(user.id, tier);

                    isFeatured = true;
                    featuredUntil = getFeaturedUntilDate();
                }
            }

            // Check active listings count (skip for unlimited tiers)
            if (limit > 0) {
                const { count } = await supabase
                    .from('properties')
                    .select('*', { count: 'exact', head: true })
                    .eq('agent_id', user.id)
                    .eq('status', 'active');

                if (count !== null && count >= limit) {
                    const tierName = tier === 'starter' || tier === 'free' ? 'Starter' : 'Pro';
                    throw new Error(`${tierName} Plan Limit Reached. You can only have ${limit} active listing${limit > 1 ? 's' : ''}. Please upgrade to post more.`);
                }
            }

            // 2. Auto-Generate Title
            const locationName = locations.find(l => l.id === formData.location_id)?.name || "Abuja";
            const typeName = landTypes.find(t => t.id === formData.land_type_id)?.name || "Land";
            const estateName = formData.estate_id ? estates.find(e => e.id === formData.estate_id)?.name : "";

            let autoTitle = `${formData.size}sqm ${typeName} in ${locationName}, Abuja`;
            if (estateName) {
                autoTitle = `${estateName} - ${formData.size}sqm ${typeName} in ${locationName}`;
            }

            // 3. Duplicate Check
            const { count: dupCount } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', user.id)
                .eq('title', autoTitle)
                .eq('price', formData.price);

            if (dupCount && dupCount > 0) {
                throw new Error("You have already posted this exact property (Same Title & Price). Please avoid duplicates.");
            }

            // 4. Prepare Data
            const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f !== "");
            const slugSource = (formData.slug || autoTitle || "").toLowerCase();
            const slugBase = slugSource.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const slug = (slugBase.slice(0, 60) || "listing") + "-" + Date.now().toString().slice(-4);
        const canAutoPublish = isPaid && isVerified;
        const initialStatus = canAutoPublish ? 'active' : 'pending';

        // 5. Prepare SEO fields with fallbacks
        const titleInput = (formData.title || "").trim();
        const finalTitle = (titleInput || autoTitle || "Land for sale in Abuja").slice(0, 120);
        const finalDescription = (formData.description || `${finalTitle}. Located at ${formData.address}. ${formData.features}`).slice(0, 5000);
        const finalMetaTitle = (formData.meta_title || finalTitle).slice(0, 60);
        const finalMetaDescription = (formData.meta_description || finalDescription.substring(0, 160)).slice(0, 160);
        const finalFocusKeyword = formData.focus_keyword || `${typeName.toLowerCase()} for sale in ${locationName}`;

        // 6. Insert
        const { error: insertError } = await supabase.from("properties").insert({
            title: finalTitle,
            description: finalDescription,
            price: parseFloat(formData.price),
            size_sqm: parseFloat(formData.size),
            district: locationName, // Legacy support
            location_id: formData.location_id,
                land_type_id: formData.land_type_id,
                estate_id: formData.estate_id || null,
                address: formData.address,
                title_type: formData.title_type,
                images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"],
                agent_id: user.id,
                slug: slug,
                status: initialStatus,
                features: featuresArray,
                meta_title: finalMetaTitle,
                meta_description: finalMetaDescription,
                focus_keyword: finalFocusKeyword,
                is_featured: isFeatured,
                featured_until: featuredUntil,
                is_distressed: formData.is_distressed,
            has_foundation: formData.has_foundation
        });

            if (insertError) {
                console.error("Insert listing error:", insertError);
                throw insertError;
            }

            if (initialStatus === 'pending') {
                alert(isVerified ? "Listing submitted! It is pending approval for your plan." : "Listing submitted! It will stay pending until verification/upgrade.");
            } else {
                alert("Property listed successfully!");
            }

            router.push("/agent/dashboard");
            router.refresh();
        } catch (err: any) {
            console.error("Error creating listing:", err);
            setError(err.message || "Failed to create listing.");
        } finally {
            clearTimeout(timeout);
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

                    {profile && (
                        <div className="mb-6">
                            <ListingQuotaDisplay
                                activeListingsCount={activeListingsCount}
                                subscriptionTier={profile.subscription_tier || 'starter'}
                                subscriptionExpiry={profile.subscription_expiry}
                                role={profile.role}
                                variant="banner"
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Location & Type */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-2">Property Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional override)</label>
                                    <Input
                                        name="title"
                                        placeholder="e.g. 600sqm Residential Plot in Dei-Dei"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate from size, type, and location.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                    <select
                                        name="location_id"
                                        className="w-full rounded-md border border-gray-200 p-2.5 bg-white"
                                        required
                                        disabled={optionsLoading}
                                        value={formData.location_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">{optionsLoading ? "Loading locations..." : "Select Location"}</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Land Type *</label>
                                    <select
                                        name="land_type_id"
                                        className="w-full rounded-md border border-gray-200 p-2.5 bg-white"
                                        required
                                        disabled={optionsLoading}
                                        value={formData.land_type_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">{optionsLoading ? "Loading land types..." : "Select Type"}</option>
                                        {landTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estate (Optional)</label>
                                <select
                                    name="estate_id"
                                    className="w-full rounded-md border border-gray-200 p-2.5 bg-white"
                                    value={formData.estate_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Estate (if applicable)</option>
                                    {estates.map(est => (
                                        <option key={est.id} value={est.id}>{est.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Size (sqm) *</label>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address / Landmark</label>
                                <Input
                                    name="address"
                                    placeholder="e.g. Plot 123, Near Shoprite"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Slug (optional)</label>
                                <Input
                                    name="slug"
                                    placeholder="e.g. karasana-east-promo"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate a short slug.</p>
                            </div>
                        </div>

                        {/* Title Type Selection */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title Document Type *</label>
                                    <select
                                        name="title_type"
                                        className="w-full rounded-md border border-gray-200 p-2.5 bg-white"
                                        required
                                        value={formData.title_type}
                                        onChange={handleChange}
                                    >
                                        <option value="C_of_O">Certificate of Occupancy (C of O)</option>
                                        <option value="R_of_O">Right of Occupancy (R of O)</option>
                                        <option value="Allocation">Allocation Letter</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Features (Comma separated)</label>
                                    <Input
                                        name="features"
                                        placeholder="e.g. Fenced, Tarred Road, Electricity"
                                        value={formData.features}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Special Categories */}
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-medium text-gray-900">Special Tags</h3>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="is_distressed"
                                        checked={formData.is_distressed}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary"
                                    />
                                    <span className="text-sm text-gray-700">Distress Sale (Urgent)</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="has_foundation"
                                        checked={formData.has_foundation}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary"
                                    />
                                    <span className="text-sm text-gray-700">Has Foundation / Unfinished Building</span>
                                </label>
                                {canFeature && (
                                    <label className="flex items-center space-x-2 pt-2 border-t mt-2">
                                        <input
                                            type="checkbox"
                                            checked={wantsFeatured}
                                            onChange={(e) => setWantsFeatured(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-700">Feature this listing on homepage (FREE)</span>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Your listing will be highlighted for 24 hours.
                                                {profile?.subscription_tier === 'pro' && ' You can only feature 1 listing at a time on your Pro plan.'}
                                                {profile?.subscription_tier === 'agency' && ' You can feature unlimited listings on your Agency plan.'}
                                            </p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Description & SEO Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Search className="h-5 w-5 text-primary" />
                                    Description & SEO
                                </h2>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateClick}
                                    className="gap-1"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Auto-Generate
                                </Button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property Description</label>
                                <textarea
                                    name="description"
                                    className="w-full rounded-md border border-gray-200 p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Describe your property in detail... (Click Auto-Generate for suggestions)"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-gray-500 mt-1">A good description helps buyers find your property</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Focus Keyword
                                        <span className="text-xs text-gray-400 ml-1">(for SEO)</span>
                                    </label>
                                    <Input
                                        name="focus_keyword"
                                        placeholder="e.g. land for sale in Guzape Abuja"
                                        value={formData.focus_keyword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Meta Title
                                        <span className="text-xs text-gray-400 ml-1">({formData.meta_title.length}/60)</span>
                                    </label>
                                    <Input
                                        name="meta_title"
                                        placeholder="SEO title for search engines"
                                        value={formData.meta_title}
                                        onChange={handleChange}
                                        maxLength={60}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Description
                                    <span className="text-xs text-gray-400 ml-1">({formData.meta_description.length}/160)</span>
                                </label>
                                <textarea
                                    name="meta_description"
                                    className="w-full rounded-md border border-gray-200 p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Brief description for search results..."
                                    value={formData.meta_description}
                                    onChange={handleChange}
                                    maxLength={160}
                                />
                            </div>

                            {/* SEO Preview */}
                            {(formData.meta_title || formData.meta_description) && (
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="text-xs text-gray-500 mb-2">Search Result Preview:</p>
                                    <div className="bg-white p-3 rounded border">
                                        <p className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                                            {formData.meta_title || "Your property title will appear here"}
                                        </p>
                                        <p className="text-green-700 text-sm">landforsaleinabuja.ng › property › ...</p>
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {formData.meta_description || "Your meta description will appear here..."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-2">Property Images</h2>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                                {formData.images && formData.images.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {formData.images.map((url, idx) => (
                                            <div key={url} className="relative h-32 rounded-lg overflow-hidden border">
                                                <Image
                                                    src={url}
                                                    alt={`Property ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            images: prev.images.filter((img) => img !== url)
                                                        }))
                                                    }
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-sm text-gray-600 mb-2">Click to upload images</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Select Images"}
                                </Button>
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

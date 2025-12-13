"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Edit, Save, Eye } from "lucide-react";

type District = {
    id: string;
    name: string;
    description: string;
    avg_price_per_sqm: number;
    infrastructure_rating: { roads: string; electricity: string; water: string } | null;
    title_type_common: string;
    pros: string[];
    cons: string[];
    tagline?: string | null;
    summary?: string | null;
    price_band_min?: number | null;
    price_band_max?: number | null;
    plot_size_range?: string | null;
    why_buy?: string[] | null;
    watch_outs?: string[] | null;
    due_diligence?: string | null;
    geo_lat?: number | null;
    geo_lng?: number | null;
    commute_notes?: string | null;
};

export default function ManageDistricts() {
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<District>>({});

    const supabase = createClient();

    const fetchDistricts = async () => {
        setLoading(true);
        const { data } = await supabase.from("districts").select("*").order("name");
        if (data) setDistricts(data as District[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchDistricts();
    }, []);

    const handleEdit = (district: District) => {
        setEditingId(district.id);
        setFormData({
            ...district,
            infrastructure_rating: district.infrastructure_rating || { roads: "", electricity: "", water: "" },
            pros: district.pros || [],
            cons: district.cons || [],
            why_buy: district.why_buy || [],
            watch_outs: district.watch_outs || [],
        });
    };

    const handleSave = async () => {
        if (!editingId) return;

        const { error } = await supabase
            .from("districts")
            .update({
                description: formData.description,
                avg_price_per_sqm: formData.avg_price_per_sqm,
                title_type_common: formData.title_type_common,
                infrastructure_rating: formData.infrastructure_rating,
                pros: formData.pros,
                cons: formData.cons,
                tagline: formData.tagline,
                summary: formData.summary,
                price_band_min: formData.price_band_min,
                price_band_max: formData.price_band_max,
                plot_size_range: formData.plot_size_range,
                why_buy: formData.why_buy,
                watch_outs: formData.watch_outs,
                due_diligence: formData.due_diligence,
                geo_lat: formData.geo_lat,
                geo_lng: formData.geo_lng,
                commute_notes: formData.commute_notes,
            })
            .eq("id", editingId);

        if (error) {
            alert("Error updating district");
            console.error(error);
        } else {
            setEditingId(null);
            fetchDistricts();
        }
    };

    const updateInfrastructure = (key: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            infrastructure_rating: { ...(prev.infrastructure_rating as any), [key]: value },
        }));
    };

    const updateArray = (field: "pros" | "cons", value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value.split(",").map((s) => s.trim()),
        }));
    };

    const updateArrayField = (field: "why_buy" | "watch_outs", value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value.split(",").map((s) => s.trim()),
        }));
    };

    if (loading) return <div className="p-8 text-center">Loading districts...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Area Guides</h1>
            <p className="text-gray-600">Add buyer-focused data to your districts to power the Area Guides.</p>

            <div className="grid gap-6">
                {districts.map((district) => (
                    <div key={district.id} className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold">{district.name}</h2>
                                {district.tagline && <p className="text-sm text-gray-600">{district.tagline}</p>}
                            </div>
                            {editingId !== district.id && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`/guides/preview/${district.name.toLowerCase()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> Preview
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(district)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit Data
                                    </Button>
                                </div>
                            )}
                        </div>

                        {editingId === district.id ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description (The Vibe)</label>
                                    <Textarea
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Avg Price (₦/sqm)</label>
                                        <Input
                                            type="number"
                                            value={formData.avg_price_per_sqm || 0}
                                            onChange={(e) =>
                                                setFormData({ ...formData, avg_price_per_sqm: parseFloat(e.target.value) })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Common Title Type</label>
                                        <Input
                                            placeholder="e.g. C of O"
                                            value={formData.title_type_common || ""}
                                            onChange={(e) => setFormData({ ...formData, title_type_common: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price Band Min (₦/sqm)</label>
                                        <Input
                                            type="number"
                                            value={formData.price_band_min || 0}
                                            onChange={(e) => setFormData({ ...formData, price_band_min: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price Band Max (₦/sqm)</label>
                                        <Input
                                            type="number"
                                            value={formData.price_band_max || 0}
                                            onChange={(e) => setFormData({ ...formData, price_band_max: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tagline</label>
                                        <Input
                                            placeholder="e.g. Premium residential enclave"
                                            value={formData.tagline || ""}
                                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Plot Size Range</label>
                                        <Input
                                            placeholder="e.g. 500–1000 sqm"
                                            value={formData.plot_size_range || ""}
                                            onChange={(e) => setFormData({ ...formData, plot_size_range: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Summary (short buyer-focused intro)</label>
                                    <Textarea
                                        rows={2}
                                        value={formData.summary || ""}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                                    <h3 className="font-semibold text-sm">Infrastructure Rating</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            placeholder="Roads (e.g. Tarred)"
                                            value={formData.infrastructure_rating?.roads || ""}
                                            onChange={(e) => updateInfrastructure("roads", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Electricity (e.g. 20hrs)"
                                            value={formData.infrastructure_rating?.electricity || ""}
                                            onChange={(e) => updateInfrastructure("electricity", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Water (e.g. Borehole)"
                                            value={formData.infrastructure_rating?.water || ""}
                                            onChange={(e) => updateInfrastructure("water", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Pros (comma separated)</label>
                                        <Textarea
                                            value={formData.pros?.join(", ") || ""}
                                            onChange={(e) => updateArray("pros", e.target.value)}
                                            placeholder="Good roads, Scenic views"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Cons (comma separated)</label>
                                        <Textarea
                                            value={formData.cons?.join(", ") || ""}
                                            onChange={(e) => updateArray("cons", e.target.value)}
                                            placeholder="Expensive, Hilly"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Why Buy (comma separated highlights)</label>
                                        <Textarea
                                            value={formData.why_buy?.join(", ") || ""}
                                            onChange={(e) => updateArrayField("why_buy", e.target.value)}
                                            placeholder="High appreciation, Estate security, Close to business district"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Watch-Outs (comma separated cautions)</label>
                                        <Textarea
                                            value={formData.watch_outs?.join(", ") || ""}
                                            onChange={(e) => updateArrayField("watch_outs", e.target.value)}
                                            placeholder="Verify title at AGIS, Steep terrain, Community levies"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Due Diligence Notes</label>
                                        <Textarea
                                            value={formData.due_diligence || ""}
                                            onChange={(e) => setFormData({ ...formData, due_diligence: e.target.value })}
                                            rows={3}
                                            placeholder="e.g. Verify title at AGIS, check estate covenants, confirm access road"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Commute Notes (CBD/Airport/Landmarks)</label>
                                        <Textarea
                                            value={formData.commute_notes || ""}
                                            onChange={(e) => setFormData({ ...formData, commute_notes: e.target.value })}
                                            rows={3}
                                            placeholder="e.g. 15 mins to CBD, 35 mins to airport off-peak"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Geo Latitude</label>
                                        <Input
                                            type="number"
                                            value={formData.geo_lat ?? ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    geo_lat: e.target.value ? parseFloat(e.target.value) : null,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Geo Longitude</label>
                                        <Input
                                            type="number"
                                            value={formData.geo_lng ?? ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    geo_lng: e.target.value ? parseFloat(e.target.value) : null,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-2">
                                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                        <Save className="w-4 h-4 mr-2" /> Save Changes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="block font-medium text-gray-500">Avg Price</span>
                                    ƒ,İ{district.avg_price_per_sqm?.toLocaleString() || 0}/sqm
                                </div>
                                <div>
                                    <span className="block font-medium text-gray-500">Title</span>
                                    {district.title_type_common || "N/A"}
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <span className="block font-medium text-gray-500">Quick Facts</span>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {district.tagline && (
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{district.tagline}</span>
                                        )}
                                        {(district.price_band_min || district.price_band_max) && (
                                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                                Price: {district.price_band_min ? `ƒ,İ${district.price_band_min}` : "—"} -{" "}
                                                {district.price_band_max ? `ƒ,İ${district.price_band_max}` : "—"}/sqm
                                            </span>
                                        )}
                                        {district.plot_size_range && (
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                                {district.plot_size_range}
                                            </span>
                                        )}
                                    </div>
                                    {district.infrastructure_rating ? (
                                        <div className="flex flex-wrap gap-2">
                                            {district.infrastructure_rating.roads && (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                    {district.infrastructure_rating.roads}
                                                </span>
                                            )}
                                            {district.infrastructure_rating.electricity && (
                                                <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs">
                                                    {district.infrastructure_rating.electricity}
                                                </span>
                                            )}
                                            {district.infrastructure_rating.water && (
                                                <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded text-xs">
                                                    {district.infrastructure_rating.water}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        "No data"
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {districts.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-gray-500">No districts found. Please add districts in the Locations tab first.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

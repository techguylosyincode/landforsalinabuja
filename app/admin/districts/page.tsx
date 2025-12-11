"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Plus, Edit, Save, X, Loader2 } from "lucide-react";

type District = {
    id: string;
    name: string;
    description: string;
    avg_price_per_sqm: number;
    infrastructure_rating: { roads: string; electricity: string; water: string };
    title_type_common: string;
    pros: string[];
    cons: string[];
};

export default function ManageDistricts() {
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<District>>({});

    const supabase = createClient();

    const fetchDistricts = async () => {
        setLoading(true);
        const { data } = await supabase.from('districts').select('*').order('name');
        if (data) setDistricts(data);
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
            cons: district.cons || []
        });
    };

    const handleSave = async () => {
        if (!editingId) return;

        const { error } = await supabase
            .from('districts')
            .update({
                description: formData.description,
                avg_price_per_sqm: formData.avg_price_per_sqm,
                title_type_common: formData.title_type_common,
                infrastructure_rating: formData.infrastructure_rating,
                pros: formData.pros,
                cons: formData.cons
            })
            .eq('id', editingId);

        if (error) {
            alert("Error updating district");
            console.error(error);
        } else {
            setEditingId(null);
            fetchDistricts();
        }
    };

    const updateInfrastructure = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            infrastructure_rating: { ...prev.infrastructure_rating as any, [key]: value }
        }));
    };

    const updateArray = (field: 'pros' | 'cons', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value.split(',').map(s => s.trim())
        }));
    };

    if (loading) return <div className="p-8 text-center">Loading districts...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manage Area Guides</h1>
            <p className="text-gray-600">Add investor data to your districts to power the Area Guides.</p>

            <div className="grid gap-6">
                {districts.map(district => (
                    <div key={district.id} className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">{district.name}</h2>
                            {editingId !== district.id && (
                                <Button variant="outline" size="sm" onClick={() => handleEdit(district)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit Data
                                </Button>
                            )}
                        </div>

                        {editingId === district.id ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description (The Vibe)</label>
                                    <Textarea
                                        value={formData.description || ""}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Avg Price (₦/sqm)</label>
                                        <Input
                                            type="number"
                                            value={formData.avg_price_per_sqm || 0}
                                            onChange={e => setFormData({ ...formData, avg_price_per_sqm: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Common Title Type</label>
                                        <Input
                                            placeholder="e.g. C of O"
                                            value={formData.title_type_common || ""}
                                            onChange={e => setFormData({ ...formData, title_type_common: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                                    <h3 className="font-semibold text-sm">Infrastructure Rating</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            placeholder="Roads (e.g. Tarred)"
                                            value={formData.infrastructure_rating?.roads || ""}
                                            onChange={e => updateInfrastructure('roads', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Electricity (e.g. 20hrs)"
                                            value={formData.infrastructure_rating?.electricity || ""}
                                            onChange={e => updateInfrastructure('electricity', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Water (e.g. Borehole)"
                                            value={formData.infrastructure_rating?.water || ""}
                                            onChange={e => updateInfrastructure('water', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Pros (comma separated)</label>
                                        <Textarea
                                            value={formData.pros?.join(', ') || ""}
                                            onChange={e => updateArray('pros', e.target.value)}
                                            placeholder="Good roads, Scenic views"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Cons (comma separated)</label>
                                        <Textarea
                                            value={formData.cons?.join(', ') || ""}
                                            onChange={e => updateArray('cons', e.target.value)}
                                            placeholder="Expensive, Hilly"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-2">
                                    <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                        <Save className="w-4 h-4 mr-2" /> Save Changes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="block font-medium text-gray-500">Avg Price</span>
                                    ₦{district.avg_price_per_sqm?.toLocaleString() || 0}/sqm
                                </div>
                                <div>
                                    <span className="block font-medium text-gray-500">Title</span>
                                    {district.title_type_common || "N/A"}
                                </div>
                                <div className="col-span-2">
                                    <span className="block font-medium text-gray-500">Infrastructure</span>
                                    {district.infrastructure_rating ? (
                                        <div className="flex gap-2">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">🛣️ {district.infrastructure_rating.roads}</span>
                                            <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs">⚡ {district.infrastructure_rating.electricity}</span>
                                        </div>
                                    ) : "No data"}
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

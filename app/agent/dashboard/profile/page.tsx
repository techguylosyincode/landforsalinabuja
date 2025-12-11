"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Phone, BadgeCheck, AlertCircle, Loader2 } from "lucide-react";

export default function AgentProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClient();
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    router.push('/login');
                    return;
                }

                setUser(user);

                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    setError("Failed to load profile data");
                    console.error("Profile fetch error:", profileError);
                } else {
                    setProfile(data);
                }
            } catch (err) {
                setError("An unexpected error occurred");
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.currentTarget);
        const updates = {
            full_name: formData.get('full_name'),
            agency_name: formData.get('agency_name'),
            phone_number: formData.get('phone_number'),
            // Add bio if we add it to schema later
        };

        const supabase = createClient();
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            alert("Error updating profile");
        } else {
            alert("Profile updated successfully");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                        <p className="text-red-800 font-medium">Error loading profile</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className="p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600 mb-8">Manage your public agent profile and verification status.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input name="full_name" defaultValue={profile?.full_name} className="pl-10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input name="agency_name" defaultValue={profile?.agency_name} className="pl-10" placeholder="Independent Agent" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input name="phone_number" defaultValue={profile?.phone_number} className="pl-10" />
                                </div>
                            </div>

                            <Button type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Verification Status */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Verification Status</h2>

                        {profile?.is_verified ? (
                            <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg border border-green-100">
                                <BadgeCheck className="h-12 w-12 text-green-600 mb-2" />
                                <h3 className="font-bold text-green-800">Verified Agent</h3>
                                <p className="text-sm text-green-600 mt-1">Your account is fully verified. You have the green badge!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <AlertCircle className="h-12 w-12 text-yellow-600 mb-2" />
                                <h3 className="font-bold text-yellow-800">Not Verified</h3>
                                <p className="text-sm text-yellow-600 mt-1 mb-4">Upload your ID to get the trusted badge and more leads.</p>
                                <Button variant="outline" size="sm" disabled>Upload ID (Coming Soon)</Button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">Subscription</h2>
                        <div className="mb-4">
                            <span className="text-sm text-gray-500">Current Plan:</span>
                            <div className="font-bold text-xl capitalize">{profile?.subscription_tier || 'Free'}</div>
                        </div>
                        <Button variant="outline" className="w-full" asChild>
                            <a href="/pricing">Upgrade Plan</a>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}

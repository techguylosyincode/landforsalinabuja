"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Phone, BadgeCheck, AlertCircle, Loader2 } from "lucide-react";
import ListingQuotaDisplay from "@/components/ListingQuotaDisplay";

export default function AgentProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
    const [activeListingsCount, setActiveListingsCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        const timeout = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 5000);

        const fetchData = async () => {
            try {
                const supabase = createClient();
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    router.push('/login');
                    return;
                }

                if (isMounted) setUser(user);

                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (profileError) {
                    setError("Failed to load profile data");
                    console.error("Profile fetch error:", profileError);
                    return;
                }

                if (!data) {
                    const metadataRole = user.user_metadata?.role as string | undefined;
                    const fallbackProfile = {
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Agent",
                        agency_name: user.user_metadata?.agency_name || (metadataRole === "agent" ? "Independent Agent" : null),
                        phone_number: user.user_metadata?.phone_number || "",
                        role: metadataRole || "agent",
                        is_verified: false,
                        verification_status: "unverified",
                        subscription_tier: "starter",
                    };

                    const { data: createdProfile, error: createError } = await supabase
                        .from('profiles')
                        .upsert(fallbackProfile)
                        .select('*')
                        .single();

                    if (createError) {
                        setError("Failed to initialize your profile");
                        console.error("Profile creation error:", createError);
                        return;
                    }

                    if (isMounted) setProfile(createdProfile);
                } else {
                    if (isMounted) setProfile(data);
                }

                // Fetch active listings count
                const { data: propertiesData } = await supabase
                    .from('properties')
                    .select('id', { count: 'exact', head: true })
                    .eq('agent_id', user.id)
                    .eq('status', 'active');

                if (isMounted && propertiesData) {
                    setActiveListingsCount(propertiesData.length || 0);
                }
            } catch (err) {
                setError("An unexpected error occurred");
                console.error("Fetch error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [router]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData(e.currentTarget);
            const fullName = formData.get('full_name') as string;
            const agencyName = formData.get('agency_name') as string;
            const phone = formData.get('phone_number') as string;

            const updates = {
                full_name: fullName,
                agency_name: agencyName,
                phone_number: phone,
                // Add bio if we add it to schema later
            };

            const supabase = createClient();
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            // Best-effort sync to auth metadata for display elsewhere
            await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone_number: phone,
                    agency_name: agencyName,
                }
            });

            if (error) {
                alert("Error updating profile");
            } else {
                alert("Profile updated successfully");
                setProfile((prev: any) => ({ ...prev, ...updates }));
            }
        } catch (err) {
            console.error("Profile update failed:", err);
            alert("Could not save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setVerificationMessage(null);
        setVerifying(true);

        try {
            const formData = new FormData(e.currentTarget);
            const idType = formData.get("id_type") as string;
            const idNumber = (formData.get("id_number") as string)?.trim();
            const cacNumber = (formData.get("cac_number") as string)?.trim();
            const files = formData.getAll("documents") as File[];

            if (!idType || !idNumber || !cacNumber) {
                setVerificationMessage("CAC number, ID type, and ID number are required.");
                return;
            }

            const validFiles = files.filter((f) => f && (f as File).size) as File[];
            if (validFiles.length === 0) {
                setVerificationMessage("Please upload at least one document (CAC or government ID).");
                return;
            }

            if (!user) {
                setVerificationMessage("You must be logged in to submit verification.");
                return;
            }

            const supabase = createClient();
            const uploadedPaths: string[] = [];

            for (const file of validFiles) {
                const path = `${user.id}/${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("agent-verifications")
                    .upload(path, file, { upsert: true });

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    setVerificationMessage("Failed to upload documents. Please try again.");
                    return;
                }
                uploadedPaths.push(path);
            }

            const { data, error: updateError } = await supabase
                .from("profiles")
                .update({
                    id_type: idType,
                    id_number: idNumber,
                    cac_number: cacNumber,
                    proof_files: uploadedPaths,
                    verification_status: "pending_review",
                    verification_reason: null,
                    verification_submitted_at: new Date().toISOString(),
                    is_verified: false,
                })
                .eq("id", user.id)
                .select("*")
                .single();

            if (updateError) {
                console.error("Verification submit error:", updateError);
                setVerificationMessage("Could not submit verification. Please try again.");
            } else {
                setProfile(data);
                setVerificationMessage("Documents submitted. We will review your CAC/ID shortly.");
            }
        } catch (err) {
            console.error("Unexpected verification error:", err);
            setVerificationMessage("Something went wrong. Please try again.");
        } finally {
            setVerifying(false);
        }
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

    const displayFullName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
    const displayAgency = profile?.agency_name || user?.user_metadata?.agency_name || "Independent Agent";
    const displayPhone = profile?.phone_number || user?.user_metadata?.phone_number || "";

    return (
        <main className="p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600 mb-8">Manage your public agent profile and verification status.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Profile Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Name</p>
                            <p className="font-semibold">{displayFullName || user?.email || "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-semibold">{user?.email || "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-semibold">{displayPhone || "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Agency</p>
                            <p className="font-semibold">{displayAgency}</p>
                        </div>
                    </div>
                </div>
            </div>

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
                                    <Input name="full_name" defaultValue={displayFullName} className="pl-10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input name="agency_name" defaultValue={displayAgency} className="pl-10" placeholder="Independent Agent" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input name="phone_number" defaultValue={displayPhone} className="pl-10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input defaultValue={user?.email || ""} disabled className="bg-gray-100" />
                                <p className="text-xs text-gray-500 mt-1">Contact support to change your email.</p>
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

                        <div className="flex items-center gap-2 mb-3">
                            {profile?.verification_status === "verified" || profile?.is_verified ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                                </span>
                            ) : profile?.verification_status === "pending_review" ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Pending Review
                                </span>
                            ) : profile?.verification_status === "rejected" ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Needs Attention
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    Not Verified
                                </span>
                            )}
                        </div>

                        {profile?.verification_status === "rejected" && profile?.verification_reason && (
                            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                                <p className="font-semibold">Rejected</p>
                                <p>{profile.verification_reason}</p>
                            </div>
                        )}

                        {profile?.verification_status === "verified" || profile?.is_verified ? (
                            <div className="flex flex-col gap-1 text-sm text-gray-700">
                                <p>Your account is fully verified. You have the green badge.</p>
                                {profile?.verified_at && (
                                    <p className="text-gray-500">Verified on {new Date(profile.verified_at).toLocaleDateString()}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-700">
                                    To get verified, upload your CAC certificate and a government-issued ID. Verification is manual and required for the green badge.
                                </p>

                                {verificationMessage && (
                                    <div className="text-sm text-primary">{verificationMessage}</div>
                                )}

                                <form className="space-y-3" onSubmit={handleVerificationSubmit}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CAC Number</label>
                                        <Input name="cac_number" defaultValue={profile?.cac_number || ""} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                                        <select
                                            name="id_type"
                                            defaultValue={profile?.id_type || "nin"}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="nin">NIN</option>
                                            <option value="passport">International Passport</option>
                                            <option value="drivers_license">Driver's License</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                                        <Input name="id_number" defaultValue={profile?.id_number || ""} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload CAC/ID (PDF or image)</label>
                                        <Input name="documents" type="file" accept=".pdf,image/*" multiple />
                                        <p className="text-xs text-gray-500 mt-1">Upload clear photos/scans of CAC certificate and your ID.</p>
                                    </div>
                                    <Button type="submit" disabled={verifying} className="w-full">
                                        {verifying ? "Submitting..." : "Submit for Verification"}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>

                    <ListingQuotaDisplay
                        activeListingsCount={activeListingsCount}
                        subscriptionTier={profile?.subscription_tier || 'starter'}
                        subscriptionExpiry={profile?.subscription_expiry}
                        role={profile?.role}
                        variant="card"
                        showUpgradeButton={true}
                    />
                </div>
            </div>
        </main>
    );
}

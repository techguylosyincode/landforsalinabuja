'use client';

import { Zap, Shield, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

interface UpgradeBannerProps {
    currentTier: string;
    variant?: 'banner' | 'card' | 'minimal';
    dismissible?: boolean;
}

export default function UpgradeBanner({
    currentTier,
    variant = 'banner',
    dismissible = true,
}: UpgradeBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    // Don't show for premium tiers
    if (currentTier === 'pro' || currentTier === 'agency' || currentTier === 'premium') {
        return null;
    }

    if (dismissed) {
        return null;
    }

    // Card variant - compact card in the stats grid
    if (variant === 'card') {
        return (
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Upgrade Your Plan</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Get more listings, verified badge, and featured placement.
                    </p>
                    <Button size="sm" asChild>
                        <Link href="/pricing">View Plans</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Minimal variant - single line
    if (variant === 'minimal') {
        return (
            <div className="flex items-center justify-between gap-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                        <span className="font-medium">Go Pro</span> — Get 15 listings and verified badge
                    </span>
                </div>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary" asChild>
                    <Link href="/pricing">Upgrade →</Link>
                </Button>
            </div>
        );
    }

    // Banner variant - full-width prominent banner
    return (
        <div className="relative mb-8 p-6 bg-gradient-to-r from-primary via-primary to-primary/90 rounded-xl text-white overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white rounded-full translate-y-1/2" />
            </div>

            {dismissible && (
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <Zap className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium text-white/80">FREE PLAN</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        Upgrade to Pro and Sell Faster
                    </h2>
                    <p className="text-white/80 max-w-xl">
                        Serious agents use Pro. Get verified badge, 15 active listings, and featured placement to close more deals.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="hidden md:flex flex-col gap-2 text-sm mr-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-secondary" />
                            <span>Verified Badge</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-secondary" />
                            <span>15 Active Listings</span>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
                        asChild
                    >
                        <Link href="/pricing">
                            Upgrade Now — ₦5,000/mo
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

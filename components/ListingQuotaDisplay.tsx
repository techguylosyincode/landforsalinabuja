'use client';

import { useMemo } from 'react';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  getListingLimit,
  getQuotaPercentage,
  getQuotaStatus,
  getStatusColors,
  formatTierName,
  getTierIcon,
  isExpiringSoon,
  isSubscriptionExpired,
  formatExpiryDate,
} from '@/lib/constants/subscription';
import Link from 'next/link';

export interface ListingQuotaDisplayProps {
  activeListingsCount: number;
  subscriptionTier: string;
  subscriptionExpiry?: string | null;
  role?: string;
  variant?: 'compact' | 'card' | 'banner';
  showUpgradeButton?: boolean;
}

export default function ListingQuotaDisplay({
  activeListingsCount,
  subscriptionTier,
  subscriptionExpiry,
  role,
  variant = 'card',
  showUpgradeButton = false,
}: ListingQuotaDisplayProps) {
  const quotaData = useMemo(() => {
    const limit = getListingLimit(subscriptionTier);
    const percentage = getQuotaPercentage(activeListingsCount, subscriptionTier);
    const status = getQuotaStatus(percentage);
    const colors = getStatusColors(status);
    const tierName = formatTierName(subscriptionTier);
    const tierIcon = getTierIcon(subscriptionTier);
    const isExpired = isSubscriptionExpired(subscriptionExpiry);
    const expiringSoon = isExpiringSoon(subscriptionExpiry);
    const expiryText = formatExpiryDate(subscriptionExpiry);

    return {
      limit,
      percentage,
      status,
      colors,
      tierName,
      tierIcon,
      isExpired,
      expiringSoon,
      expiryText,
      isUnlimited: limit === -1,
    };
  }, [activeListingsCount, subscriptionTier, subscriptionExpiry]);

  // Card variant - for dashboard and profile
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'bg-white p-6 rounded-lg shadow-sm border',
          quotaData.colors.border,
          quotaData.isExpired && 'border-red-300 bg-red-50'
        )}
      >
        {/* Header with icon and title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className={cn('font-medium', quotaData.isExpired ? 'text-red-700' : 'text-gray-500')}>
              {quotaData.isExpired ? 'Subscription Expired' : 'Listing Quota'}
            </h3>
          </div>
          <span className="text-2xl">{quotaData.tierIcon}</span>
        </div>

        {/* Quota display */}
        <div className="mb-4">
          {quotaData.isUnlimited ? (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">Unlimited</span>
              <span className="text-sm text-gray-500">listings available</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-3xl font-bold',
                  quotaData.isExpired ? 'text-red-600' : quotaData.colors.text
                )}
              >
                {activeListingsCount}/{quotaData.limit}
              </span>
              <span className={cn('text-sm', quotaData.isExpired ? 'text-red-600' : 'text-gray-500')}>
                listings used ({Math.round(quotaData.percentage)}%)
              </span>
            </div>
          )}
        </div>

        {/* Progress bar (only for limited tiers) */}
        {!quotaData.isUnlimited && (
          <div className="mb-4">
            <div className={cn('h-2 rounded-full overflow-hidden', quotaData.colors.progressBg)}>
              <div
                className={cn('h-full transition-all duration-300', quotaData.colors.barBg)}
                style={{ width: `${Math.min(quotaData.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Subscription info */}
        <div className="flex flex-col gap-1 mb-4">
          <p className={cn('text-xs font-medium', quotaData.isExpired ? 'text-red-700' : 'text-gray-600')}>
            {quotaData.tierName}
          </p>
          {quotaData.expiryText && (
            <p
              className={cn(
                'text-xs',
                quotaData.expiringSoon || quotaData.isExpired ? 'text-orange-600 font-medium' : 'text-gray-500'
              )}
            >
              {quotaData.expiryText}
            </p>
          )}
        </div>

        {/* Status message */}
        {quotaData.isExpired && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-sm text-red-700">Your subscription has expired. Please renew to continue listing properties.</p>
          </div>
        )}

        {quotaData.percentage >= 90 && !quotaData.isUnlimited && !quotaData.isExpired && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="text-sm text-yellow-700">
              You're using {activeListingsCount} of {quotaData.limit} listings. Consider upgrading for more capacity.
            </p>
          </div>
        )}

        {/* Upgrade button */}
        {showUpgradeButton && !quotaData.isUnlimited && (
          <Button variant="default" className="w-full" asChild>
            <Link href="/pricing">Upgrade to {quotaData.subscriptionTier === 'pro' || quotaData.subscriptionTier === 'premium' ? 'Agency Plan' : 'Pro Plan'}</Link>
          </Button>
        )}
      </div>
    );
  }

  // Banner variant - for new listing page warning
  if (variant === 'banner') {
    const shouldShowWarning = quotaData.percentage >= 75 && !quotaData.isUnlimited;
    const shouldShowError = quotaData.percentage >= 100 && !quotaData.isUnlimited;

    if (!shouldShowWarning && !quotaData.isExpired) {
      return null; // Don't show banner if all is well
    }

    if (quotaData.isExpired) {
      return (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-700 mb-1">Subscription Expired</h3>
              <p className="text-sm text-red-600 mb-3">
                Your subscription has expired. You cannot create new listings until you renew your subscription.
              </p>
              <Button variant="destructive" size="sm" asChild>
                <Link href="/pricing">Renew Subscription</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (shouldShowError) {
      return (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-700 mb-1">Listing Limit Reached</h3>
              <p className="text-sm text-red-600 mb-3">
                You've used all {quotaData.limit} listings on your {quotaData.tierName}. Delete an existing listing or upgrade to create more.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" asChild>
                  <Link href="/pricing">Upgrade Plan</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/agent/dashboard">Manage Listings</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (shouldShowWarning) {
      return (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-700 mb-1">Approaching Listing Limit</h3>
              <p className="text-sm text-yellow-600 mb-3">
                You're using {activeListingsCount} of {quotaData.limit} listings on your {quotaData.tierName}. You have {quotaData.limit - activeListingsCount} listing{quotaData.limit - activeListingsCount !== 1 ? 's' : ''} remaining.
              </p>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/pricing">Upgrade to Agency Plan</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Compact variant - for inline display
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-md text-sm', quotaData.colors.bg)}>
      <span className="text-lg">{quotaData.tierIcon}</span>
      {quotaData.isUnlimited ? (
        <span className={quotaData.colors.text}>Unlimited listings</span>
      ) : (
        <>
          <span className={cn('font-medium', quotaData.colors.text)}>
            {activeListingsCount}/{quotaData.limit}
          </span>
          <span className={quotaData.colors.text}>
            ({Math.round(quotaData.percentage)}%)
          </span>
        </>
      )}
    </div>
  );
}

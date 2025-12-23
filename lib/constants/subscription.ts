/**
 * Subscription and Listing Quota Constants
 *
 * This file contains all subscription tier information and listing limits.
 * Used across the application to maintain consistency in quota enforcement.
 */

export type SubscriptionTier = 'starter' | 'free' | 'pro' | 'premium' | 'agency';

/**
 * Maximum number of active listings allowed per subscription tier
 * -1 indicates unlimited listings
 */
export const LISTING_LIMITS: Record<SubscriptionTier, number> = {
  'starter': 1,
  'free': 1,
  'pro': 30,
  'premium': 30,
  'agency': -1, // unlimited
};

/**
 * Get the listing limit for a specific subscription tier
 * @param tier - The subscription tier
 * @returns The maximum number of listings allowed, or -1 for unlimited
 */
export function getListingLimit(tier: string): number {
  return LISTING_LIMITS[tier as SubscriptionTier] ?? 1;
}

/**
 * Check if a user has reached their listing limit
 * @param activeListingsCount - Current number of active listings
 * @param tier - The subscription tier
 * @returns true if the user has reached their limit
 */
export function isListingLimitReached(activeListingsCount: number, tier: string): boolean {
  const limit = getListingLimit(tier);
  if (limit === -1) return false; // Unlimited
  return activeListingsCount >= limit;
}

/**
 * Calculate the percentage of listings used
 * @param activeListingsCount - Current number of active listings
 * @param tier - The subscription tier
 * @returns Percentage of quota used (0-100), or 0 for unlimited plans
 */
export function getQuotaPercentage(activeListingsCount: number, tier: string): number {
  const limit = getListingLimit(tier);
  if (limit === -1) return 0; // Unlimited
  return Math.min((activeListingsCount / limit) * 100, 100);
}

/**
 * Determine the quota status for visual feedback
 * @param percentage - The quota percentage (0-100)
 * @returns Status level: 'safe' | 'warning' | 'danger'
 */
export function getQuotaStatus(percentage: number): 'safe' | 'warning' | 'danger' {
  if (percentage >= 90) return 'danger';
  if (percentage >= 75) return 'warning';
  return 'safe';
}

/**
 * Format subscription tier for display (e.g., 'pro' -> 'Pro Plan')
 * @param tier - The subscription tier
 * @returns Formatted tier name for display
 */
export function formatTierName(tier: string): string {
  const tierMap: Record<string, string> = {
    'starter': 'Starter Plan',
    'free': 'Free Plan',
    'pro': 'Pro Plan',
    'premium': 'Premium Plan',
    'agency': 'Agency Plan',
  };
  return tierMap[tier] || 'Basic Plan';
}

/**
 * Get the tier icon/emoji for display
 * @param tier - The subscription tier
 * @returns Unicode emoji representing the tier
 */
export function getTierIcon(tier: string): string {
  const iconMap: Record<string, string> = {
    'starter': '🌱',
    'free': '🌱',
    'pro': '⭐',
    'premium': '⭐',
    'agency': '🏢',
  };
  return iconMap[tier] || '📋';
}

/**
 * Get color scheme for quota status
 * @param status - The quota status
 * @returns Object with Tailwind color classes
 */
export function getStatusColors(status: 'safe' | 'warning' | 'danger') {
  const colorMap = {
    safe: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      barBg: 'bg-green-500',
      progressBg: 'bg-green-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      barBg: 'bg-yellow-500',
      progressBg: 'bg-yellow-100',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      barBg: 'bg-red-500',
      progressBg: 'bg-red-100',
    },
  };
  return colorMap[status];
}

/**
 * Check if subscription is expiring soon
 * @param expiryDate - The subscription expiry date
 * @param daysThreshold - Number of days to consider "soon" (default: 7)
 * @returns true if expiring within threshold
 */
export function isExpiringSoon(expiryDate: string | null | undefined, daysThreshold: number = 7): boolean {
  if (!expiryDate) return false;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
}

/**
 * Check if subscription has expired
 * @param expiryDate - The subscription expiry date
 * @returns true if the subscription has expired
 */
export function isSubscriptionExpired(expiryDate: string | null | undefined): boolean {
  if (!expiryDate) return false;

  const now = new Date();
  const expiry = new Date(expiryDate);

  return expiry < now;
}

/**
 * Get the effective subscription tier (accounting for expiry)
 * @param tier - The subscription tier
 * @param expiryDate - The subscription expiry date
 * @returns The effective tier (defaults to 'starter' if expired)
 */
export function getEffectiveTier(tier: string, expiryDate: string | null | undefined): SubscriptionTier {
  if (isSubscriptionExpired(expiryDate)) {
    return 'starter';
  }
  return (tier as SubscriptionTier) || 'starter';
}

/**
 * Format remaining days until expiry for display
 * @param expiryDate - The subscription expiry date
 * @returns Formatted string (e.g., "5 days left", "Expires Jan 15, 2025")
 */
export function formatExpiryDate(expiryDate: string | null | undefined): string {
  if (!expiryDate) return '';

  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return 'Expired';
  }

  if (daysLeft === 0) {
    return 'Expires today';
  }

  if (daysLeft === 1) {
    return 'Expires tomorrow';
  }

  if (daysLeft <= 30) {
    return `${daysLeft} days left`;
  }

  // Format as date
  return `Renews: ${expiry.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

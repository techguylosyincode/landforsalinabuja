import { createClient } from '@/lib/supabase/client';

/**
 * Get the number of free featured listings allowed per subscription tier
 * @param tier - The subscription tier
 * @returns Number of concurrent featured listings allowed
 */
export function getFeaturedLimit(tier: string): number {
  const featuredLimits: Record<string, number> = {
    'starter': 0,
    'free': 0,
    'pro': 1,
    'premium': 1,
    'agency': -1, // unlimited
  };
  return featuredLimits[tier] ?? 0;
}

/**
 * Check if user can feature another listing
 * @param userId - The user ID
 * @param tier - The subscription tier
 * @returns true if user can feature another listing
 */
export async function canFeatureListing(userId: string, tier: string): Promise<boolean> {
  const limit = getFeaturedLimit(tier);

  // Starter/Free tiers cannot feature
  if (limit === 0) return false;

  // Agency tier has unlimited featured
  if (limit === -1) return true;

  // Count current featured listings
  const supabase = createClient();
  const { count } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', userId)
    .eq('is_featured', true)
    .gt('featured_until', new Date().toISOString());

  return (count || 0) < limit;
}

/**
 * Un-feature old listings to make room for a new one (pro tier only)
 * @param userId - The user ID
 * @param tier - The subscription tier
 * @param newListingId - The ID of the new listing being featured (to exclude it)
 */
export async function rotateFeatureListing(
  userId: string,
  tier: string,
  newListingId?: string
): Promise<void> {
  const limit = getFeaturedLimit(tier);

  // Only rotate for pro tier (limit = 1)
  if (limit !== 1) return;

  const supabase = createClient();

  // Get all active featured listings for this user
  const { data: featuredListings } = await supabase
    .from('properties')
    .select('id')
    .eq('agent_id', userId)
    .eq('is_featured', true)
    .gt('featured_until', new Date().toISOString())
    .order('featured_until', { ascending: true });

  if (!featuredListings || featuredListings.length === 0) return;

  // Filter out the new listing if provided
  const toUnfeature = newListingId
    ? featuredListings.filter(l => l.id !== newListingId)
    : featuredListings;

  // Un-feature the oldest listings
  if (toUnfeature.length > 0) {
    await supabase
      .from('properties')
      .update({
        is_featured: false,
        featured_until: null
      })
      .in('id', toUnfeature.map(l => l.id));
  }
}

/**
 * Calculate featured_until date (1 day from now)
 */
export function getFeaturedUntilDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString();
}

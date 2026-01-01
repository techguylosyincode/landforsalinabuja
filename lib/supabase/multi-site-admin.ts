import { createClient } from '@supabase/supabase-js';

export type SiteIdentifier = 'land' | 'house' | '9ja';

interface SiteConfig {
  url: string;
  serviceKey: string;
}

const SITE_CONFIGS: Record<SiteIdentifier, SiteConfig> = {
  land: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },
  house: {
    url: process.env.HOUSES_SUPABASE_URL!,
    serviceKey: process.env.HOUSES_SUPABASE_SERVICE_KEY!,
  },
  '9ja': {
    url: process.env.NINEJA_SUPABASE_URL!,
    serviceKey: process.env.NINEJA_SUPABASE_SERVICE_KEY!,
  },
};

/**
 * Extract site identifier from payment reference
 * Examples:
 *   "land_boost_123_1234567890" → "land"
 *   "house_subscription_456_1234567890" → "house"
 *   "9ja_boost_789_1234567890" → "9ja"
 */
export function extractSiteFromReference(reference: string): SiteIdentifier | null {
  if (reference.startsWith('land_')) return 'land';
  if (reference.startsWith('house_')) return 'house';
  if (reference.startsWith('9ja_')) return '9ja';
  return null;
}

/**
 * Create admin client for the specified site
 */
export function createMultiSiteAdminClient(site: SiteIdentifier) {
  const config = SITE_CONFIGS[site];

  if (!config.url || !config.serviceKey) {
    throw new Error(`Missing configuration for site: ${site}`);
  }

  return createClient(config.url, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create admin client based on payment reference
 */
export function createClientFromReference(reference: string) {
  const site = extractSiteFromReference(reference);

  if (!site) {
    throw new Error(
      `Invalid reference format: ${reference}. Must start with land_, house_, or 9ja_`
    );
  }

  return createMultiSiteAdminClient(site);
}

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// This script enforces subscription expiry and listing limits.
// It is intended to be run manually or on a scheduler (e.g., cron/GitHub Action).

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE credentials (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function enforceExpiryForAllUsers() {
  // 1) Find expired users
  const { data: expiredProfiles, error: expiredError } = await supabase
    .from("profiles")
    .select("id")
    .lt("subscription_expiry", new Date().toISOString());

  if (expiredError) throw expiredError;
  if (!expiredProfiles || expiredProfiles.length === 0) {
    console.log("No expired profiles found.");
    return;
  }

  const expiredIds = expiredProfiles.map((p) => p.id);

  // 2) Downgrade to starter
  const { error: downgradeError } = await supabase
    .from("profiles")
    .update({
      subscription_tier: "starter",
      subscription_expiry: null,
    })
    .in("id", expiredIds);

  if (downgradeError) throw downgradeError;

  // 3) For each user, enforce listing limit (keep 1 active)
  for (const userId of expiredIds) {
    const { data: props, error: propError } = await supabase
      .from("properties")
      .select("id, updated_at, created_at")
      .eq("agent_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (propError) {
      console.error("Property fetch error for user", userId, propError);
      continue;
    }

    if (!props || props.length <= 1) continue;

    const toUnpublish = props.slice(1).map((p) => p.id);
    const { error: unpubError } = await supabase
      .from("properties")
      .update({ status: "pending", is_featured: false, featured_until: null })
      .in("id", toUnpublish);

    if (unpubError) {
      console.error("Unpublish error for user", userId, unpubError);
    } else {
      console.log(`User ${userId}: unpublished ${toUnpublish.length} listings (kept 1 active).`);
    }
  }
}

enforceExpiryForAllUsers()
  .then(() => {
    console.log("Expiry enforcement complete.");
  })
  .catch((err) => {
    console.error("Expiry enforcement failed:", err);
    process.exit(1);
  });

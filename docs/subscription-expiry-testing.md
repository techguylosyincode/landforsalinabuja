# Subscription Expiry – Quick Test Guide (Non‑production)

This is a small, manual playbook to simulate plan expiry and see how listings should respond. It avoids code changes and works entirely via SQL or an ad-hoc script you can run locally.

## Prereqs
- You have `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- You have a test user with multiple active listings (so you can see the downgrade effect).

## 1) Pick a test user
Run in Supabase SQL editor (or `psql`):
```sql
select id, email, subscription_tier, subscription_expiry
from profiles
order by created_at desc
limit 5;
```
Copy the `id` of the test user you want to downgrade.

## 2) Simulate “paid but expiring in 1 minute”
```sql
update profiles
set subscription_tier = 'pro',
    subscription_expiry = now() + interval '1 minute'
where id = '<USER_ID>';
```

## 3) Prepare listings to observe behavior
- Ensure the same user has 2+ listings with `status = 'active'` (via UI or SQL):
```sql
select id, title, status, is_featured, featured_until
from properties
where agent_id = '<USER_ID>';
```

## 4) Run a manual “expiry enforcement” (one-off)
When you want to enforce expiry (as if a cron ran), execute:
```sql
-- Downgrade if expired
update profiles
set subscription_tier = 'starter',
    subscription_expiry = null
where id = '<USER_ID>'
  and subscription_expiry < now();

-- Unpublish extras, keep 1 most-recent active
with ranked as (
  select id,
         row_number() over (order by updated_at desc nulls last, created_at desc) as rn
  from properties
  where agent_id = '<USER_ID>' and status = 'active'
)
update properties p
set status = 'pending',
    is_featured = false,
    featured_until = null
from ranked r
where p.id = r.id
  and r.rn > 1;
```

## 5) Validate in the UI
- Refresh the agent dashboard/listings: only 1 listing should remain active; others should be inactive/pending.
- Pricing page should show `starter`.

## Optional: tiny Node script to run the enforcement locally
Save as `scripts/enforce-expiry.ts` and run with `npx ts-node scripts/enforce-expiry.ts`. Replace `<USER_ID>` first.
```ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  const USER_ID = '<USER_ID>';

  // Downgrade if expired
  await supabase.from('profiles')
    .update({ subscription_tier: 'starter', subscription_expiry: null })
    .lte('subscription_expiry', new Date().toISOString())
    .eq('id', USER_ID);

  // Fetch active listings to rank
  const { data: props } = await supabase
    .from('properties')
    .select('id, updated_at, created_at')
    .eq('agent_id', USER_ID)
    .eq('status', 'active')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (!props || props.length <= 1) return;

  const toUnpublish = props.slice(1).map(p => p.id);
  await supabase.from('properties')
    .update({ status: 'pending', is_featured: false, featured_until: null })
    .in('id', toUnpublish);
}

main().then(() => console.log('Expiry enforcement simulated')).catch(console.error);
```

## What to observe
- After the enforcement, user’s plan shows as `starter`, and only 1 listing stays active.
- Featured flags should be cleared on unpublished listings.
- No deletions occur; re-upgrading can re-activate listings manually.

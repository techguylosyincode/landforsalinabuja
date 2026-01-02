# QA TEST PLAN - landforsaleinabuja-93kl
## Pre-Launch Verification Checklist
**Date**: January 2, 2026
**Project**: landforsaleinabuja-93kl (Production)
**Status**: Ready for QA Testing

---

## PHASE 1: INFRASTRUCTURE & FILE VERIFICATION ✅

### 1.1 Critical Files Verification
- [x] `app/not-found.tsx` - Custom 404 page exists
- [x] `app/error.tsx` - Route-level error boundary exists
- [x] `app/global-error.tsx` - Global error boundary exists
- [x] `public/logo.png` - Logo asset exists
- [x] `app/privacy/page.tsx` - Privacy policy page exists
- [x] `app/terms/page.tsx` - Terms of service page exists
- [x] `app/cookies/page.tsx` - Cookie policy page exists
- [x] `lib/supabase/multi-site-admin.ts` - Multi-site routing factory exists
- [x] `app/api/paystack/webhook/route.ts` - Webhook handler exists
- [x] `app/agent/dashboard/payments/page.tsx` - Payment history page exists
- [x] `supabase/migrations/20250101_create_transactions_table.sql` - Transactions table migration exists

### 1.2 Environment Configuration
- [x] `.env.local` contains all required variables:
  - NEXT_PUBLIC_SUPABASE_URL ✓
  - SUPABASE_SERVICE_KEY ✓
  - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ✓
  - PAYSTACK_SECRET_KEY ✓
  - HOUSES_SUPABASE_URL ✓ (for multi-site)
  - HOUSES_SUPABASE_SERVICE_KEY ✓
  - NINEJA_SUPABASE_URL ✓ (for multi-site)
  - NINEJA_SUPABASE_SERVICE_KEY ✓

### 1.3 Supabase Database
- [x] `transactions` table created with:
  - id (uuid) - Primary key
  - user_id (uuid) - Foreign key to auth.users
  - reference (text) - Unique payment reference
  - transaction_type (text) - 'subscription' or 'boost'
  - amount (numeric) - Payment amount
  - subscription_tier (text) - 'pro' or 'agency'
  - billing_cycle (text) - 'monthly' or 'annual'
  - property_id (uuid) - For boost transactions
  - boost_duration (integer) - Days (7, 14, 30)
  - status (text) - 'pending', 'success', 'failed', 'abandoned'
  - gateway_response (jsonb) - Full Paystack response
  - created_at, verified_at, webhook_received_at (timestamptz)
- [x] RLS policies configured:
  - Users can view own transactions
  - Service role has full access
- [x] Indexes created for performance

---

## PHASE 2: PAYMENT SECURITY VERIFICATION ✅

### 2.1 API Key Management
- [x] All API keys loaded from environment variables (not hardcoded)
- [x] `app/api/boost/route.ts` uses `process.env.PAYSTACK_SECRET_KEY`
- [x] `app/api/paystack/verify/route.ts` uses `process.env.PAYSTACK_SECRET_KEY`
- [x] `components/BoostButton.tsx` uses `process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- [x] `app/pricing/page.tsx` uses `process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- [x] Webhook secret validation in place

### 2.2 Webhook Security
- [x] HMAC SHA512 signature verification implemented
- [x] Invalid signatures rejected with 401 Unauthorized
- [x] Payload validation before processing
- [x] Rate limiting consideration (check Paystack logs)

### 2.3 Transaction Logging
- [x] All transactions recorded BEFORE payment verification
- [x] Full Paystack response stored in `gateway_response` field
- [x] User IP and user agent captured for audit trail
- [x] Timestamps recorded for all state changes

---

## PHASE 3: PAYMENT FLOW VERIFICATION ⏳

### 3.1 Subscription Payment Flow
**Scenario**: User upgrades from Starter to Pro (₦5,000/month)

**Steps to Test**:
```
1. Navigate to /pricing
2. Click "Upgrade to Pro"
3. Paystack modal opens
4. Complete payment (use test card: 4111111111111111)
5. Wait for redirect to dashboard
6. Expected result:
   - User's profile tier = 'pro'
   - subscription_expiry = 30 days from now
   - Transaction status = 'success'
   - is_verified = true
```

**Implementation Details**:
- PaystackButton generates reference: `land_subscription_{userId}_{timestamp}`
- API endpoint: `/api/paystack/verify`
- Creates transaction record (pending state)
- Verifies payment with Paystack API
- Checks amount matches (₦5,000 or ₦15,000)
- Updates profile on success
- Records gateway response for debugging

### 3.2 Boost Payment Flow
**Scenario**: Agent boosts a property for 14 days (₦5,000)

**Steps to Test**:
```
1. Navigate to a property listing (/buy/[district]/[slug])
2. Click "Boost" button
3. Select "14 Days" option (₦5,000)
4. Click "Pay ₦5,000"
5. Complete Paystack payment
6. Expected result:
   - Property is_featured = true
   - featured_until = 14 days from now
   - "FEATURED" badge appears on PropertyCard
   - Transaction status = 'success'
   - Agent can see boost in /agent/dashboard/payments
```

**Implementation Details**:
- BoostButton generates reference: `land_boost_{propertyId}_{timestamp}`
- API endpoint: `/api/boost`
- Creates transaction record (pending state)
- Verifies payment with Paystack
- Updates property is_featured + featured_until
- Records transaction with property_id

### 3.3 Webhook Delivery Flow
**Scenario**: Paystack sends webhook for charge.success event

**Steps to Test**:
```
1. In Paystack Dashboard → Webhooks:
   - URL: https://www.landforsaleinabuja.ng/api/paystack/webhook
   - Events: charge.success, charge.failed, charge.timeout
2. Send test webhook from Paystack
3. Expected behavior:
   - Request signature verified (HMAC SHA512)
   - Reference parsed to extract site ('land', 'house', or '9ja')
   - Correct Supabase client instantiated
   - Transaction updated with verified_at timestamp
   - Profile/property updated based on transaction type
   - Logs show: "Webhook [land]: Processing charge.success..."
```

**Implementation Details**:
- Webhook validates signature with `process.env.PAYSTACK_SECRET_KEY`
- Extracts site from reference prefix (land_, house_, 9ja_)
- Routes to correct database using multi-site client factory
- Implements idempotency (doesn't process twice)
- Handles three event types: charge.success, charge.failed, charge.timeout

---

## PHASE 4: ERROR HANDLING VERIFICATION ⏳

### 4.1 Custom 404 Page
**Test Scenario**: User navigates to non-existent page

**Steps**:
```
1. Navigate to: https://www.landforsaleinabuja.ng/non-existent-page
2. Expected result:
   - Shows custom 404 page (not default Next.js error)
   - Page displays: "404" + "Page Not Found"
   - Two CTAs: "Go Home" and "Search Properties"
   - Matches site design system
```

**Files**:
- `app/not-found.tsx` - Implements custom not-found component

### 4.2 Error Boundary
**Test Scenario**: Component throws unexpected error

**Steps**:
```
1. (Dev only) Temporarily add: throw new Error("Test error")
2. Navigate to affected route
3. Expected result:
   - Shows custom error page (not white screen)
   - Displays error message
   - "Try Again" button present
   - Clicking "Try Again" resets error boundary
```

**Files**:
- `app/error.tsx` - Route-level error handler
- `app/global-error.tsx` - Global fallback for layout errors

### 4.3 Missing Environment Variables
**Test Scenario**: Run without critical env vars

**Expected behavior**:
- `PAYSTACK_SECRET_KEY` missing → throws error on server start
- `PAYSTACK_WEBHOOK_SECRET` missing → webhook requests fail gracefully
- Services fail fast with clear error messages (not silent failures)

### 4.4 Payment Verification Failures
**Test Scenarios**:

**4.4a: Amount Mismatch**
- User pays ₦4,999 instead of ₦5,000
- Expected: Transaction marked as 'failed'
- Expected: Profile NOT updated

**4.4b: Duplicate Payment Reference**
- User submits same reference twice
- Expected: Second request rejected (already processed)
- Expected: User charged only once

**4.4c: Invalid Reference Format**
- Webhook receives reference without site prefix
- Expected: Returns 400 error
- Expected: Logs: "Invalid reference format"

**4.4d: Missing Transaction Record**
- Webhook arrives before API call created transaction
- Expected: Returns 404 gracefully
- Expected: Does not crash

---

## PHASE 5: SEO & METADATA VERIFICATION ✅

### 5.1 Canonical URLs
**Check all pages have canonical tags**:
- [x] Homepage: `<link rel="canonical" href="https://landforsaleinabuja.ng" />`
- [x] Blog posts: `<link rel="canonical" href="https://landforsaleinabuja.ng/blog/{slug}" />`
- [x] District pages: `<link rel="canonical" href="https://landforsaleinabuja.ng/buy/{district}" />`
- [x] Property pages: `<link rel="canonical" href="https://landforsaleinabuja.ng/buy/{district}/{slug}" />`
- [x] Pricing page: `<link rel="canonical" href="https://landforsaleinabuja.ng/pricing" />`
- [x] Sell page: `<link rel="canonical" href="https://landforsaleinabuja.ng/sell" />`

**Verification Tool**: Inspect page source or use Chrome DevTools

### 5.2 Twitter Cards
**Check all pages have Twitter meta tags**:
- [x] `<meta name="twitter:card" content="summary_large_image" />`
- [x] `<meta name="twitter:site" content="@landinabuja" />`
- [x] `<meta name="twitter:title" content="..." />`
- [x] `<meta name="twitter:description" content="..." />`
- [x] `<meta name="twitter:image" content="..." />`

**Verification Tool**: https://cards-dev.twitter.com/validator

### 5.3 OpenGraph Tags
- [x] Homepage has og:image with correct dimensions
- [x] Blog posts have og:image
- [x] District pages have og:image
- [x] Property pages have og:image

**Verification Tool**: https://developers.facebook.com/tools/debug/

### 5.4 JSON-LD Structured Data
- [x] WebSite schema on homepage
- [x] RealEstateListing schema on property pages
- [x] Article schema on blog posts
- [x] FAQPage schema on homepage and district pages
- [x] Logo URL points to existing asset: `/logo.png`

**Verification Tool**: https://search.google.com/test/rich-results

---

## PHASE 6: FEATURED LISTING VERIFICATION ⏳

### 6.1 Badge Display
**Test Scenario**: Property with active boost

**Expected behavior**:
```
1. Property is_featured = true
2. featured_until = "2026-01-16T10:30:00Z" (future date)
3. PropertyCard shows yellow "FEATURED" badge top-left
4. Badge displays Zap icon
```

**Implementation**: `components/PropertyCard.tsx` lines 64-69

### 6.2 Badge Expiry
**Test Scenario**: Property boost expires

**Expected behavior**:
```
1. Property is_featured = true
2. featured_until = "2026-01-01T10:30:00Z" (past date)
3. Badge does NOT appear (expiry check)
4. Background cron job (future enhancement) will set is_featured = false
```

**Implementation**: Date comparison: `new Date(featured_until) > new Date()`

### 6.3 Dashboard Display
**Test Scenario**: Agent views payment history

**Expected behavior**:
```
1. Navigate to /agent/dashboard/payments
2. See all user's transactions (subscriptions + boosts)
3. See current subscription tier + expiry date
4. See boost transactions with duration and amount
5. Transactions sorted by created_at (newest first)
```

---

## PHASE 7: LEGAL COMPLIANCE VERIFICATION ✅

### 7.1 Privacy Policy
- [x] Page loads at `/privacy`
- [x] Covers data collection, usage, sharing, security
- [x] NDPR compliance mentioned
- [x] Contact information included
- [x] Canonical URL set

### 7.2 Terms of Service
- [x] Page loads at `/terms`
- [x] Covers user responsibilities, limitations of liability
- [x] Payment terms (non-refundable)
- [x] Prohibited activities
- [x] Governing law (Nigerian)

### 7.3 Cookie Policy
- [x] Page loads at `/cookies`
- [x] Explains cookie usage
- [x] Third-party cookies (Paystack, Supabase)
- [x] Browser cookie management instructions

### 7.4 Footer Links
- [x] Footer contains "Legal" section
- [x] Links to Privacy, Terms, Cookies pages
- [x] All links clickable and working

---

## PHASE 8: MULTI-SITE WEBHOOK VERIFICATION ⏳

### 8.1 Reference Prefix Routing
**Current Status**: Code complete, requires other site setup

**Test Scenario**: Payment from hypothetical house site

**Expected behavior**:
```
1. housesforsaleinabuja.com generates reference: house_boost_456_1234567890
2. Paystack webhook sent to landforsaleinabuja.com/api/paystack/webhook
3. Handler extracts site: 'house'
4. Creates client for housesforsaleinabuja database
5. Updates transaction in HOUSES database
6. Updates property is_featured in HOUSES database
```

**Implementation**: `lib/supabase/multi-site-admin.ts` + webhook routing

### 8.2 Prerequisites for Other Sites
**Status**: Pending

To activate multi-site webhook:
- [ ] housesforsaleinabuja.com: Create transactions table
- [ ] 9jadirectory.org: Create transactions table
- [ ] Both sites: Update BoostButton reference format
- [ ] Both sites: Update PaystackButton reference format

---

## CRITICAL TEST CASES (MUST PASS)

### Test 1: Complete Subscription Flow
```
Precondition: User logged in, not subscribed
1. Go to /pricing
2. Click "Upgrade to Pro"
3. Paystack modal appears
4. Enter test card: 4111111111111111
5. Click "Pay"
6. Wait for success message
7. Redirect to /agent/dashboard
8. Check profile: tier = 'pro', expiry = 30 days away
9. Check Supabase: transactions table has entry with status='success'
10. Check Supabase: profiles table updated with subscription_tier, subscription_expiry

Result: ✅ PASS or ❌ FAIL
```

### Test 2: Complete Boost Flow
```
Precondition: User logged in, property exists in dashboard
1. Navigate to property page
2. Click "Boost" button
3. Modal opens, select "14 Days" (₦5,000)
4. Click "Pay ₦5,000"
5. Paystack modal appears
6. Enter test card: 4111111111111111
7. Complete payment
8. Return to property page
9. Check: "FEATURED" badge appears top-left
10. Check Supabase: property is_featured=true, featured_until=14 days from now
11. Check Supabase: transactions table has status='success'

Result: ✅ PASS or ❌ FAIL
```

### Test 3: Webhook Signature Verification
```
Precondition: Webhook handler is running
1. Send webhook request without signature header
2. Expected: 401 Unauthorized
3. Send webhook with wrong signature
4. Expected: 401 Unauthorized
5. Send valid test webhook from Paystack dashboard
6. Expected: 200 OK, transaction updated

Result: ✅ PASS or ❌ FAIL
```

### Test 4: 404 Error Handling
```
1. Navigate to /this-page-does-not-exist
2. Expected: Custom 404 page displays
3. Expected: Not default Next.js error
4. Click "Go Home"
5. Expected: Redirects to homepage

Result: ✅ PASS or ❌ FAIL
```

### Test 5: Featured Badge Expiry
```
Precondition: Property with is_featured=true, featured_until in past
1. Navigate to property page
2. Expected: "FEATURED" badge does NOT appear
3. Check PropertyCard logic: Date comparison works correctly

Result: ✅ PASS or ❌ FAIL
```

---

## MONITORING & LOGGING

### Logs to Check
- Server logs for webhook events
- Paystack dashboard for webhook delivery status
- Supabase transaction table for payment records
- Browser console for client-side errors

### Paystack Dashboard Checks
- [ ] Webhook URL configured correctly
- [ ] Events enabled: charge.success, charge.failed, charge.timeout
- [ ] Recent webhook deliveries show status
- [ ] No webhook failures or retries (after first successful test)

### Supabase Checks
- [ ] transactions table populated with payments
- [ ] profiles table updated with subscription tier + expiry
- [ ] properties table updated with is_featured + featured_until
- [ ] RLS policies not blocking legitimate queries

---

## LAUNCH READINESS CHECKLIST

### Must Pass Before Launch
- [ ] Test 1: Complete Subscription Flow - PASS
- [ ] Test 2: Complete Boost Flow - PASS
- [ ] Test 3: Webhook Signature Verification - PASS
- [ ] Test 4: 404 Error Handling - PASS
- [ ] Test 5: Featured Badge Expiry - PASS
- [ ] All canonical URLs present (page source inspection)
- [ ] Twitter Card validator shows no errors
- [ ] Rich Results Test shows valid structured data
- [ ] No broken links in navigation
- [ ] Legal pages load without errors

### Post-Launch Monitoring (First Week)
- [ ] Monitor failed payment rate (target <5%)
- [ ] Check webhook delivery success (target >95%)
- [ ] Review transaction logs for patterns
- [ ] Monitor error logs for crashes
- [ ] Check Google Search Console index coverage

---

## DEPLOYMENT NOTES

### Vercel Settings
- Domain: www.landforsaleinabuja.ng
- Project: landforsalinabuja-93kl
- Environment: Production
- Branch: main

### Paystack Configuration
- Account: Personal/Team account
- API Keys: Test keys for current environment
- Webhook URL: https://www.landforsaleinabuja.ng/api/paystack/webhook
- Events: charge.success, charge.failed, charge.timeout

### Database
- Primary: xrjbglcwdqwqihonpwmn (landforsaleinabuja)
- Secondary: gopfavvqqezdqeouhqjg (housesforsaleinabuja) - optional
- Tertiary: txupvudwbroyxfyccdhw (9jadirectory) - optional

---

## SIGN-OFF

**Tested By**: [Your Name]
**Date Tested**: ___________
**All Tests Passed**: [ ] Yes [ ] No
**Issues Found**: [Document any blockers]
**Launch Approved**: [ ] Yes [ ] No

---

**Status**: 🟡 Ready for QA Testing
**Next Step**: Execute critical test cases and document results above.

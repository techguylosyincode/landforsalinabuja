import { createAdminClient } from "@/lib/supabase/admin";
import { createClientFromReference, extractSiteFromReference } from "@/lib/supabase/multi-site-admin";
import { NextResponse } from "next/server";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY environment variable is not configured");
}

/**
 * Verify Paystack webhook signature
 * Uses HMAC SHA512 to verify authenticity
 */
function verifyPaystackSignature(payload: string, signature: string): boolean {
    try {
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY!)
            .update(payload)
            .digest('hex');
        return hash === signature;
    } catch (error) {
        console.error("Signature verification error:", error);
        return false;
    }
}

export async function POST(request: Request) {
    try {
        // Get signature from headers
        const signature = request.headers.get('x-paystack-signature');
        if (!signature) {
            console.warn("Webhook: Missing signature header");
            return NextResponse.json(
                { error: "Missing signature" },
                { status: 401 }
            );
        }

        // Get raw body for signature verification
        const rawBody = await request.text();

        // Verify signature
        if (!verifyPaystackSignature(rawBody, signature)) {
            console.warn("Webhook: Invalid signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // Parse the webhook payload
        const event = JSON.parse(rawBody);

        console.log("Webhook: Received event", event.event, "Reference:", event.data?.reference);

        const reference = event.data?.reference;

        // Extract site from reference
        const site = extractSiteFromReference(reference);

        if (!site) {
            console.error("Webhook: Invalid reference format (missing site prefix):", reference);
            return NextResponse.json(
                { error: "Invalid reference format" },
                { status: 400 }
            );
        }

        console.log(`Webhook [${site}]: Received ${event.event} for reference: ${reference}`);

        // Create database client for the correct site
        const supabase = createClientFromReference(reference);

        // Handle different event types
        if (event.event === "charge.success") {
            return await handleChargeSuccess(supabase, event, reference, site);
        } else if (event.event === "charge.failed") {
            return await handleChargeFailed(supabase, reference, site);
        } else if (event.event === "charge.timeout") {
            return await handleChargeTimeout(supabase, reference, site);
        } else {
            console.log(`Webhook [${site}]: Unhandled event type:`, event.event);
            return NextResponse.json({ status: "ok" }, { status: 200 });
        }
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle successful charge
 */
async function handleChargeSuccess(
    supabase: any,
    event: any,
    reference: string,
    site: string
) {
    try {
        if (!reference) {
            return NextResponse.json(
                { error: "Missing reference" },
                { status: 400 }
            );
        }

        // Check if we already processed this transaction (idempotency)
        const { data: existingTx } = await supabase
            .from('transactions')
            .select('id, status, webhook_received_at')
            .eq('reference', reference)
            .single();

        if (!existingTx) {
            console.warn(`Webhook [${site}]: Transaction not found for reference:`, reference);
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        // Check if already processed successfully
        if (existingTx.status === 'success') {
            console.log(`Webhook [${site}]: Transaction already processed:`, reference);
            return NextResponse.json(
                { status: "ok", message: "Already processed" },
                { status: 200 }
            );
        }

        // Update transaction with webhook receipt
        const { error: updateTxError } = await supabase
            .from('transactions')
            .update({
                status: 'success',
                verified_at: new Date().toISOString(),
                webhook_received_at: new Date().toISOString(),
                gateway_response: event
            })
            .eq('reference', reference);

        if (updateTxError) {
            console.error(`Webhook [${site}]: Failed to update transaction:`, updateTxError);
            throw updateTxError;
        }

        // Handle transaction based on type
        const { data: transaction } = await supabase
            .from('transactions')
            .select('*')
            .eq('reference', reference)
            .single();

        if (!transaction) {
            console.error(`Webhook [${site}]: Could not fetch updated transaction`);
            return NextResponse.json({ status: "ok" }, { status: 200 });
        }

        if (transaction.transaction_type === 'subscription') {
            // Update profile for subscription
            const expiryDate = new Date();
            if (transaction.billing_cycle === 'annual') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            } else {
                expiryDate.setDate(expiryDate.getDate() + 30);
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    subscription_tier: transaction.subscription_tier,
                    subscription_expiry: expiryDate.toISOString(),
                    is_verified: true,
                    verification_status: 'verified',
                    verified_at: new Date().toISOString(),
                })
                .eq('id', transaction.user_id);

            if (profileError) {
                console.error(`Webhook [${site}]: Failed to update profile:`, profileError);
                throw profileError;
            }

            console.log(`Webhook [${site}]: Subscription updated for user:`, transaction.user_id);
        } else if (transaction.transaction_type === 'boost') {
            // Update property for boost
            const featuredUntil = new Date();
            featuredUntil.setDate(featuredUntil.getDate() + transaction.boost_duration);

            const { error: propertyError } = await supabase
                .from('properties')
                .update({
                    is_featured: true,
                    featured_until: featuredUntil.toISOString()
                })
                .eq('id', transaction.property_id);

            if (propertyError) {
                console.error(`Webhook [${site}]: Failed to update property:`, propertyError);
                throw propertyError;
            }

            console.log(`Webhook [${site}]: Property featured for:`, transaction.property_id);
        }

        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (error) {
        console.error(`Webhook [${site}]: charge.success error:`, error);
        return NextResponse.json(
            { error: "Processing error" },
            { status: 500 }
        );
    }
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(supabase: any, reference: string, site: string) {
    try {
        if (!reference) {
            return NextResponse.json(
                { error: "Missing reference" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('transactions')
            .update({
                status: 'failed',
                webhook_received_at: new Date().toISOString()
            })
            .eq('reference', reference)
            .eq('status', 'pending'); // Only update if still pending

        if (error) {
            console.error(`Webhook [${site}]: Failed to update transaction status:`, error);
            throw error;
        }

        console.log(`Webhook [${site}]: Charge marked failed:`, reference);
        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (error) {
        console.error(`Webhook [${site}]: charge.failed error:`, error);
        return NextResponse.json(
            { error: "Processing error" },
            { status: 500 }
        );
    }
}

/**
 * Handle charge timeout
 */
async function handleChargeTimeout(supabase: any, reference: string, site: string) {
    try {
        if (!reference) {
            return NextResponse.json(
                { error: "Missing reference" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('transactions')
            .update({
                status: 'abandoned',
                webhook_received_at: new Date().toISOString()
            })
            .eq('reference', reference)
            .eq('status', 'pending'); // Only update if still pending

        if (error) {
            console.error(`Webhook [${site}]: Failed to update transaction status:`, error);
            throw error;
        }

        console.log(`Webhook [${site}]: Charge marked abandoned:`, reference);
        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (error) {
        console.error(`Webhook [${site}]: charge.timeout error:`, error);
        return NextResponse.json(
            { error: "Processing error" },
            { status: 500 }
        );
    }
}

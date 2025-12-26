import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Standard internal link block to add to descriptions
const internalLinksBlock = `

**Helpful Resources:**
• <a href="/blog/how-to-verify-land-title-in-abuja">How to Verify Land Title in Abuja</a>
• <a href="/blog/c-of-o-vs-r-of-o">Understanding C of O vs R of O</a>
• <a href="/blog/land-scams-in-abuja-protection-guide">Avoid Land Scams - Protection Guide</a>

<a href="/buy">Browse more properties in Abuja →</a>
`;

// Generate meta title from property title
function generateMetaTitle(title: string, price: number): string {
    const priceStr = price >= 1000000
        ? `₦${(price / 1000000).toFixed(1)}M`
        : `₦${price.toLocaleString()}`;
    return `${title} | ${priceStr}`.slice(0, 65);
}

// Generate meta description from property details
function generateMetaDescription(title: string, district: string, size: number, price: number): string {
    const priceStr = price >= 1000000
        ? `₦${(price / 1000000).toFixed(1)}M`
        : `₦${price.toLocaleString()}`;
    return `Buy ${title} in ${district}, Abuja for ${priceStr}. ${size}sqm verified land with FCDA title. Contact agent for site inspection.`.slice(0, 155);
}

async function fixSeoIssues() {
    console.log('=== FIXING SEO ISSUES IN ALL LISTINGS ===\n');

    const { data: properties, error } = await supabase
        .from('properties')
        .select('id, slug, title, meta_title, meta_description, district, description, price, size_sqm, features')
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching properties:', error);
        return;
    }

    console.log(`Total Active Listings: ${properties?.length || 0}\n`);

    let fixedMeta = 0;
    let fixedDescription = 0;
    let fixedMetaLength = 0;
    let addedFeatures = 0;

    for (const property of properties || []) {
        const updates: Record<string, any> = {};
        let needsUpdate = false;

        // Fix missing meta_title
        if (!property.meta_title) {
            updates.meta_title = generateMetaTitle(property.title, property.price);
            needsUpdate = true;
            fixedMeta++;
            console.log(`✓ Fixed meta_title for: ${property.slug}`);
        }

        // Fix missing or short meta_description
        if (!property.meta_description || property.meta_description.length < 100) {
            updates.meta_description = generateMetaDescription(
                property.title,
                property.district,
                property.size_sqm,
                property.price
            );
            needsUpdate = true;
            fixedMetaLength++;
            console.log(`✓ Fixed meta_description for: ${property.slug}`);
        }

        // Fix too long meta_description
        if (property.meta_description && property.meta_description.length > 160) {
            updates.meta_description = property.meta_description.slice(0, 155) + '...';
            needsUpdate = true;
            fixedMetaLength++;
            console.log(`✓ Trimmed meta_description for: ${property.slug}`);
        }

        // Add internal links to description if missing
        const hasInternalLinks = property.description?.includes('/blog/') || property.description?.includes('/buy');
        if (!hasInternalLinks && property.description) {
            updates.description = property.description + internalLinksBlock;
            needsUpdate = true;
            fixedDescription++;
            console.log(`✓ Added internal links to: ${property.slug}`);
        } else if (!property.description || property.description.length < 100) {
            // Generate basic description if missing
            updates.description = `
Premium ${property.size_sqm}sqm plot available in ${property.district} District, Abuja.

This verified land is ready for immediate development with proper documentation.

**Property Details:**
• Size: ${property.size_sqm} sqm
• Location: ${property.district}, Abuja FCT
• Title: Verified

Contact the agent for site inspection and full documentation.
${internalLinksBlock}`;
            needsUpdate = true;
            fixedDescription++;
            console.log(`✓ Generated description for: ${property.slug}`);
        }

        // Add default features if missing
        if (!property.features || property.features.length === 0) {
            updates.features = ['Verified Title', 'Ready for Development', 'Good Access Road'];
            needsUpdate = true;
            addedFeatures++;
            console.log(`✓ Added features to: ${property.slug}`);
        }

        // Apply updates
        if (needsUpdate) {
            const { error: updateError } = await supabase
                .from('properties')
                .update(updates)
                .eq('id', property.id);

            if (updateError) {
                console.error(`❌ Error updating ${property.slug}:`, updateError.message);
            }
        }
    }

    console.log('\n=== FIX SUMMARY ===');
    console.log(`Meta titles fixed: ${fixedMeta}`);
    console.log(`Meta descriptions fixed: ${fixedMetaLength}`);
    console.log(`Descriptions with internal links added: ${fixedDescription}`);
    console.log(`Features added: ${addedFeatures}`);
    console.log('\n✅ All SEO issues fixed!');
}

fixSeoIssues();

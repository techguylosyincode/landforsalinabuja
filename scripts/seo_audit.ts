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

async function auditListings() {
    console.log('=== SEO AUDIT OF ALL PROPERTY LISTINGS ===\n');

    const { data: properties, error } = await supabase
        .from('properties')
        .select('id, slug, title, meta_title, meta_description, district, features, description')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching properties:', error);
        return;
    }

    console.log(`Total Active Listings: ${properties?.length || 0}\n`);
    console.log('Checking each listing for SEO elements...\n');

    let issues: string[] = [];
    let totalChecked = 0;

    for (const property of properties || []) {
        totalChecked++;
        const propertyIssues: string[] = [];

        // Check Meta Title
        if (!property.meta_title) {
            propertyIssues.push('❌ Missing meta_title');
        } else if (property.meta_title.length < 30) {
            propertyIssues.push(`⚠️ Meta title too short (${property.meta_title.length} chars)`);
        } else if (property.meta_title.length > 70) {
            propertyIssues.push(`⚠️ Meta title too long (${property.meta_title.length} chars)`);
        }

        // Check Meta Description
        if (!property.meta_description) {
            propertyIssues.push('❌ Missing meta_description');
        } else if (property.meta_description.length < 100) {
            propertyIssues.push(`⚠️ Meta description too short (${property.meta_description.length} chars)`);
        } else if (property.meta_description.length > 160) {
            propertyIssues.push(`⚠️ Meta description too long (${property.meta_description.length} chars)`);
        }

        // Check Title (H1)
        if (!property.title) {
            propertyIssues.push('❌ Missing title (H1)');
        }

        // Check Features
        if (!property.features || property.features.length === 0) {
            propertyIssues.push('⚠️ No features listed');
        }

        // Check Description for Internal Links
        const hasInternalLinks = property.description?.includes('/blog/') || property.description?.includes('/buy/');
        if (!hasInternalLinks) {
            propertyIssues.push('⚠️ No internal links in description');
        }

        // Check if description exists
        if (!property.description || property.description.length < 100) {
            propertyIssues.push('❌ Description too short or missing');
        }

        if (propertyIssues.length > 0) {
            console.log(`\n${totalChecked}. ${property.title?.slice(0, 50)}...`);
            console.log(`   Slug: ${property.district}/${property.slug}`);
            propertyIssues.forEach(issue => console.log(`   ${issue}`));
            issues.push(`${property.district}/${property.slug}: ${propertyIssues.join(', ')}`);
        } else {
            console.log(`✓ ${totalChecked}. ${property.title?.slice(0, 50)}... - All SEO elements OK`);
        }
    }

    console.log('\n=== AUDIT SUMMARY ===');
    console.log(`Total Listings Checked: ${totalChecked}`);
    console.log(`Listings with Issues: ${issues.length}`);
    console.log(`Listings Fully Optimized: ${totalChecked - issues.length}`);

    if (issues.length > 0) {
        console.log('\n=== LISTINGS NEEDING ATTENTION ===');
        issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    }
}

auditListings();

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

async function updatePaymentPlans() {
    console.log('Updating Mshel listings with Payment Plan feature...');

    // Fetch Mshel listings
    const { data: listings, error } = await supabase
        .from('properties')
        .select('*')
        .ilike('title', '%Mshel%');

    if (error) {
        console.error('Error fetching listings:', error);
        return;
    }

    console.log(`Found ${listings.length} Mshel listings.`);

    for (const listing of listings) {
        let features = listing.features || [];
        if (!features.includes('Payment Plan')) {
            features.push('Payment Plan');

            const { error: updateError } = await supabase
                .from('properties')
                .update({ features })
                .eq('id', listing.id);

            if (updateError) {
                console.error(`Error updating ${listing.title}:`, updateError);
            } else {
                console.log(`Updated ${listing.title}`);
            }
        } else {
            console.log(`Skipping ${listing.title} (already has Payment Plan)`);
        }
    }

    // Also update some random expensive listings
    const { data: expensiveListings } = await supabase
        .from('properties')
        .select('*')
        .gt('price', 50000000)
        .limit(10);

    if (expensiveListings) {
        for (const listing of expensiveListings) {
            let features = listing.features || [];
            if (!features.includes('Payment Plan')) {
                features.push('Payment Plan');
                await supabase.from('properties').update({ features }).eq('id', listing.id);
                console.log(`Updated expensive listing: ${listing.title}`);
            }
        }
    }

    console.log('Update complete.');
}

updatePaymentPlans();

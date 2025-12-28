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

async function setCommercialProperties() {
    console.log('Updating 5 random properties to be "commercial"...');

    // First get 5 IDs
    const { data: properties, error: fetchError } = await supabase
        .from('properties')
        .select('id')
        .limit(5);

    if (fetchError || !properties) {
        console.error('Error fetching properties:', fetchError);
        return;
    }

    const ids = properties.map(p => p.id);

    // Update them
    const { error: updateError } = await supabase
        .from('properties')
        .update({ type: 'commercial' })
        .in('id', ids);

    if (updateError) {
        console.error('Error updating properties:', updateError);
    } else {
        console.log(`Successfully updated ${ids.length} properties to commercial.`);
    }
}

setCommercialProperties();

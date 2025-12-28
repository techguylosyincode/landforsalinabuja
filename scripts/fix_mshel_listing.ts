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
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMshelOasis() {
    console.log('Fixing Mshel Oasis Listing...');

    // 1. Find or Create "A.I Realent Global Resources" Agent
    let { data: agent } = await supabase
        .from('profiles')
        .select('id')
        .eq('agency_name', 'A.I Realent Global Resources')
        .maybeSingle();

    if (!agent) {
        console.log('Agent not found. Creating/Updating profile...');
        // Try to find a generic agent to update, or create new if possible (but we can't create auth users easily here without admin API for auth, but we can insert into profiles if we have an ID. 
        // Actually, profiles are linked to auth.users. We can't just create a profile without a user.
        // STRATEGY: Update the EXISTING agent that owns the property to have this name.

        const { data: property } = await supabase
            .from('properties')
            .select('agent_id')
            .eq('slug', 'luxury-5-bedroom-fully-detached-duplex-mshel-oasis-court-guzape')
            .single();

        if (property && property.agent_id) {
            console.log(`Updating existing agent ${property.agent_id} details...`);
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: 'A.I Realent Global Resources',
                    agency_name: 'A.I Realent Global Resources',
                    is_verified: true,
                    phone_number: '08000000000' // Placeholder or keep existing if we select it first
                })
                .eq('id', property.agent_id);

            if (updateError) console.error('Error updating agent:', updateError);
            agent = { id: property.agent_id };
        } else {
            console.error('Could not find property or agent to update.');
            return;
        }
    }

    // 2. Update Property Images (Force cache bust if needed, but path is same)
    // We will update the image paths just to be sure, maybe add a query param or just re-set them.
    // Also ensure the agent_id is set correctly.

    const images = [
        "/images/properties/mshel-oasis/image-0.jpg",
        "/images/properties/mshel-oasis/image-1.jpg",
        "/images/properties/mshel-oasis/image-2.jpg",
        "/images/properties/mshel-oasis/image-3.jpg",
        "/images/properties/mshel-oasis/image-4.jpg"
    ];

    const { error: propError } = await supabase
        .from('properties')
        .update({
            agent_id: agent.id,
            images: images
        })
        .eq('slug', 'luxury-5-bedroom-fully-detached-duplex-mshel-oasis-court-guzape');

    if (propError) {
        console.error('Error updating property:', propError);
    } else {
        console.log('Success! Property updated with correct Agent and Images.');
    }
}

fixMshelOasis();

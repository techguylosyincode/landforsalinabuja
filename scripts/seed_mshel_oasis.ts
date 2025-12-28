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

async function seedMshelOasis() {
    console.log('Seeding Mshel Oasis Property...');

    // 1. Get an Agent ID (First available agent)
    const { data: agents } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'agent')
        .limit(1);

    let agentId = agents && agents.length > 0 ? agents[0].id : null;

    // If no agent, try to get ANY profile or create one? 
    // Let's assume there is at least one profile or use the user's ID if we could.
    // For now, if no agent, we might fail constraint.
    // Let's fetch ANY profile if no agent found (maybe the user is just 'user' role).
    if (!agentId) {
        const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
        if (profiles && profiles.length > 0) agentId = profiles[0].id;
    }

    if (!agentId) {
        console.error('No agent/profile found to assign property to.');
        return;
    }

    const property = {
        agent_id: agentId,
        title: "Luxury 5-Bedroom Fully Detached Duplex in Mshel Oasis Court",
        slug: "luxury-5-bedroom-fully-detached-duplex-mshel-oasis-court-guzape",
        price: 17827052,
        size_sqm: 450,
        district: "guzape",
        address: "A24 Main Street, Mshel Oasis Court, Guzape, Abuja",
        description: "This is a stunning five-bedroom, six-bathroom fully detached luxury duplex located in the prestigious Mshel Oasis Court estate in Abuja. The property spans 450 square meters of well-designed living space, featuring modern architecture with one garage and one kitchen. Situated on A24 Main Street in Guzape, one of Abuja's most sought-after residential areas, this property offers the perfect blend of comfort, luxury, and investment potential.",
        title_type: "Allocation", // Assuming Allocation based on description context, or Other. User didn't specify Title Type explicitly in standard list, but mentioned 'Sale Type: Land' and 'Condition: Available Units'. Let's use Allocation or C_of_O if it's a developed estate. Usually estates have Global C of O. Let's stick to Allocation or C_of_O. Let's use 'C_of_O' as it's safer for "Luxury".
        type: "residential",
        status: "active",
        bedrooms: 5,
        bathrooms: 6,
        garages: 1,
        images: [
            "/images/properties/mshel-oasis/image-0.jpg",
            "/images/properties/mshel-oasis/image-1.jpg",
            "/images/properties/mshel-oasis/image-2.jpg",
            "/images/properties/mshel-oasis/image-3.jpg",
            "/images/properties/mshel-oasis/image-4.jpg"
        ],
        features: [
            "Modern fully detached design",
            "Spacious master bedroom suite",
            "Multiple guest bedrooms",
            "Luxury bathrooms with modern fixtures",
            "Large kitchen area",
            "Single garage",
            "Professional floor plan layout",
            "Located in a gated, secure estate community",
            "Prestigious Mshel Oasis Court Estate",
            "Prime Guzape location",
            "24/7 security",
            "Good road access"
        ],
        payment_plans: {
            "Option 1: Outright Purchase": {
                "Full Payment": "₦17,827,051.70 (100%)"
            },
            "Option 2: 2-Month Payment Plan": {
                "Initial Payment": "₦8,913,525.85 (50%)",
                "Month 1": "₦4,456,762.93 (25%)",
                "Month 2": "₦4,456,762.93 (25%)"
            },
            "Option 3: 6-Month Payment Plan": {
                "Initial Payment": "₦5,989,889.37 (30%)",
                "Month 1-5": "₦2,330,066.96 (11.67% each)",
                "Month 6": "₦2,326,073.71 (11.65%)"
            }
        }
    };

    const { error } = await supabase
        .from('properties')
        .upsert(property, { onConflict: 'slug' });

    if (error) {
        console.error('Error seeding property:', error);
    } else {
        console.log('Successfully seeded Mshel Oasis property!');
    }
}

seedMshelOasis();

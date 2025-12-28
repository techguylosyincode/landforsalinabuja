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

async function seedScadens() {
    console.log('Seeding Scadens district...');

    const districtData = {
        name: 'Scadens',
        slug: 'scadens',
        description: 'Scadens is an emerging district in Abuja offering excellent investment opportunities.',
        market_analysis: {
            avg_price_sqm: 40000,
            growth_rate: "15%",
            demand_score: 8
        },
        why_invest: [
            "Affordable entry price",
            "High appreciation potential",
            "Developing infrastructure"
        ],
        infrastructure: [
            "Road networks under development",
            "Proximity to major districts"
        ],
        faqs: [
            {
                question: "Where is Scadens located?",
                answer: "Scadens is located in the Federal Capital Territory, offering easy access to central Abuja."
            }
        ]
    };

    const { error } = await supabase
        .from('districts')
        .upsert(districtData, { onConflict: 'slug' });

    if (error) {
        console.error('Error seeding district:', error);
    } else {
        console.log('Scadens district seeded successfully.');
    }
}

seedScadens();

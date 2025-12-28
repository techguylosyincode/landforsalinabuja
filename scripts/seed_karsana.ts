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

const karsanaData = {
    slug: 'karsana',
    name: 'karsana',
    description: "Karsana is one of the fastest-growing districts in Abuja Phase 4. Located along the Kubwa Expressway, it offers excellent land banking opportunities and is becoming a major residential hub.",
    image_url: "https://images.unsplash.com/photo-1598556776374-13617a08aa43?q=80&w=1000&auto=format&fit=crop", // Generic construction/development image
    market_analysis: {
        averagePrice: "₦35,000,000",
        appreciationRate: "22% per annum",
        rentalYield: "8-10%",
        demandLevel: "High"
    },
    why_invest: [
        "**Strategic Location:** Situated right on the Kubwa Expressway, offering easy access to the City Center (20 mins).",
        "**Affordability:** Prices are significantly lower than Gwarinpa, yet it shares similar connectivity.",
        "**Rapid Development:** Major estates like Brains & Hammers and others are already developing here, boosting value.",
        "**Government Focus:** As part of Phase 4, infrastructure projects are ramping up."
    ],
    infrastructure: [
        "Kubwa Expressway Access",
        "Brains & Hammers Estate",
        "Public Power Supply",
        "Developing Internal Roads"
    ],
    faqs: [
        {
            question: "Is Karsana a good place to live?",
            answer: "Yes, it is becoming a preferred choice for middle-income families due to its affordability and proximity to Gwarinpa."
        },
        {
            question: "What is the price of land in Karsana?",
            answer: "Plots typically range from ₦20 million to ₦60 million depending on the exact location (Karsana East vs West) and title."
        },
        {
            question: "Is Karsana prone to demolition?",
            answer: "Karsana is a planned district. As long as you buy within an approved estate or have a valid FCDA title, your investment is secure."
        }
    ]
};

async function seedKarsana() {
    console.log('Seeding Karsana...');
    const { error } = await supabase
        .from('districts')
        .upsert(karsanaData, { onConflict: 'slug' });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Karsana added.');
    }
}

seedKarsana();

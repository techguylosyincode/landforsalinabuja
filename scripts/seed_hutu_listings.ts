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

// A.I Realent Agent ID
const AI_REALENT_AGENT_ID = '62760ce7-8d89-42bc-99b7-8d1bdd25f09d';

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Common description with internal links for SEO
const hutuDescription = `
**HUTU EXCLUSIVE - Africa's First Polo Golf Resort Estate**

Located on Airport Road, just beyond the Nnamdi Azikiwe International Airport and Centenary City, Hutu Abuja represents a premium investment opportunity in one of Abuja's fastest-growing corridors.

**Estate Overview:**
• Total Estate Size: 118.21 Hectares
• Title: FCDA R of O (Right of Occupancy) - <a href="/blog/c-of-o-vs-r-of-o">Learn about title types →</a>
• Location: Airport Road, Before Centenary City, Abuja

**Estate Amenities:**
• Gated Community with Controlled Access
• Property Management and Maintenance Team
• Recreational Area
• Commercial Space
• Polo Golf Course
• Resort Facilities

**Nearby Landmarks:**
• Nnamdi Azikiwe International Airport
• Centenary City
• Innovatech Farms
• Ebikay's Kitchen
• ACO Quarry

**Documentation Process:**
• Before Payment: Offer Letter
• After Initial Deposit: Payment Receipt & Provisional Allocation
• Subsequent Payments: Payment Receipts
• Final Payment: Allocation Letter & Final Receipt

**Why Invest in Airport Road Corridor?**
The Airport Road axis is experiencing rapid development with major infrastructure projects. Properties in this area have seen significant appreciation. <a href="/blog/how-to-verify-land-title-in-abuja">Verify land titles before purchase →</a>

**Flexible Payment Plans Available:** 4, 8, 12, and 18-month options.

📍 Location: <a href="https://maps.app.goo.gl/BAdmGmALPvBEEpGk7" target="_blank">View on Google Maps</a>

<a href="/buy/lugbe">View more properties near Airport Road →</a>
`;

// Hutu Land Listings - 8 properties
const hutuListings = [
    {
        title: '150sqm Land in Hutu Polo Golf Estate Abuja - 3 Bedroom Terrace',
        size: 150,
        price: 9331200,
        metaTitle: '150sqm Land for Sale Hutu Estate Airport Road Abuja | ₦9.3M',
        metaDescription: 'Buy 150sqm land in Hutu Polo Golf Resort, Airport Road Abuja. FCDA R of O title, gated estate with golf course. Perfect for 3 bedroom terrace duplex. Flexible payment.',
        features: ['Polo Golf Resort', 'FCDA Approved', 'Gated Community', '3 Bedroom Terrace'],
        image: '/images/properties/hutu-aerial-1.jpg',
    },
    {
        title: '250sqm Land in Hutu Polo Golf Estate Abuja - 4 Bedroom Semi Detached',
        size: 250,
        price: 15552000,
        metaTitle: '250sqm Land for Sale Hutu Estate Airport Road | ₦15.5M',
        metaDescription: 'Buy 250sqm land in Hutu Polo Golf Resort Estate, Airport Road Abuja for ₦15.55M. FCDA R of O, premium gated estate. Ideal for 4 bedroom semi-detached duplex.',
        features: ['Polo Golf Resort', 'FCDA Approved', 'Resort Facilities', '4 Bedroom Semi-Detached'],
        image: '/images/properties/hutu-aerial-2.jpg',
    },
    {
        title: '350sqm Land in Hutu Polo Golf Estate Abuja - 4 Bedroom Detached',
        size: 350,
        price: 21772800,
        metaTitle: '350sqm Plot for Sale Hutu Estate Airport Road Abuja | ₦21.7M',
        metaDescription: 'Buy 350sqm land in Hutu Polo Golf Resort, near Centenary City Abuja for ₦21.77M. FCDA approved, golf resort estate. Perfect for 4 bedroom fully detached duplex.',
        features: ['Polo Golf Resort', 'FCDA Approved', 'Commercial Space', '4 Bedroom Detached'],
        image: '/images/properties/hutu-aerial-3.jpg',
    },
    {
        title: '500sqm Land in Hutu Polo Golf Estate Abuja - 5 Bedroom Duplex',
        size: 500,
        price: 31104000,
        metaTitle: '500sqm Land for Sale Airport Road Abuja | Hutu Polo Golf Estate',
        metaDescription: 'Buy 500sqm premium land in Hutu Polo Golf Resort Estate, Airport Road Abuja for ₦31.1M. FCDA R of O title. Ideal for 5 bedroom fully detached duplex development.',
        features: ['Polo Golf Resort', 'FCDA Approved', 'Premium Location', '5 Bedroom Duplex'],
        image: '/images/properties/hutu-aerial-1.jpg',
    },
    {
        title: '1000sqm Land in Hutu Polo Golf Estate Abuja - 7 Bedroom Mansion',
        size: 1000,
        price: 62208000,
        metaTitle: '1000sqm Land for Sale Hutu Estate Airport Road | Premium Plot',
        metaDescription: 'Buy 1000sqm prime land in Hutu Polo Golf Resort Estate, Airport Road Abuja for ₦62.2M. FCDA approved, luxury golf resort. Perfect for 7 bedroom mansion development.',
        features: ['Polo Golf Resort', 'FCDA Approved', 'Luxury Plot', '7 Bedroom Mansion'],
        image: '/images/properties/hutu-aerial-2.jpg',
    },
    {
        title: '450sqm Commercial Land in Hutu Estate - Block of Apartments',
        size: 450,
        price: 27993600,
        metaTitle: '450sqm Commercial Land Airport Road Abuja | Block of Flats Plot',
        metaDescription: 'Buy 450sqm commercial land in Hutu Polo Golf Estate, Airport Road Abuja for ₦27.99M. FCDA R of O, perfect for 1 bedroom block of apartments investment.',
        features: ['Commercial Use', 'FCDA Approved', 'Investment Grade', '1 Bedroom Block of Flat'],
        image: '/images/properties/hutu-aerial-3.jpg',
    },
    {
        title: '750sqm Commercial Land in Hutu Estate - 2 Bedroom Block of Flats',
        size: 750,
        price: 46650000,
        metaTitle: '750sqm Land for Block of Flats Airport Road Abuja | ₦46.6M',
        metaDescription: 'Buy 750sqm commercial land in Hutu Polo Golf Estate, Airport Road Abuja for ₦46.65M. FCDA approved, ideal for 2 bedroom block of apartments development.',
        features: ['Commercial Use', 'FCDA Approved', 'High ROI', '2 Bedroom Block of Flat'],
        image: '/images/properties/hutu-aerial-1.jpg',
    },
    {
        title: '1000sqm Commercial Land in Hutu Estate - 3 Bedroom Block of Flats',
        size: 1000,
        price: 62208000,
        metaTitle: '1000sqm Commercial Land Airport Road Abuja | Premium Investment',
        metaDescription: 'Buy 1000sqm commercial land in Hutu Polo Golf Estate for ₦62.2M. FCDA R of O title, premium location near Centenary City. Ideal for 3 bedroom block of flats.',
        features: ['Commercial Use', 'FCDA Approved', 'Premium Investment', '3 Bedroom Block of Flat'],
        image: '/images/properties/hutu-aerial-2.jpg',
    },
];

async function seedHutuListings() {
    console.log('Seeding Hutu Exclusive listings for A.I Realent...\n');

    for (let i = 0; i < hutuListings.length; i++) {
        const listing = hutuListings[i];
        const slug = slugify(listing.title) + '-hutu';

        const property = {
            title: listing.title,
            slug: slug,
            district: 'lugbe', // Airport Road is in Lugbe area
            address: 'Hutu Polo Golf Estate, Airport Road, Before Centenary City, Abuja FCT',
            price: listing.price,
            size_sqm: listing.size,
            title_type: 'R_of_O',
            description: hutuDescription,
            features: listing.features,
            images: [listing.image],
            status: 'active',
            agent_id: AI_REALENT_AGENT_ID,
            meta_title: listing.metaTitle,
            meta_description: listing.metaDescription,
        };

        const { error } = await supabase.from('properties').insert(property);

        if (error) {
            console.error(`❌ Error inserting ${listing.title}:`, error.message);
        } else {
            console.log(`✓ Created: ${listing.title}`);
        }
    }

    console.log('\n✅ Hutu Exclusive listings complete!');
    console.log(`Total listings created: ${hutuListings.length}`);
    console.log('Agent: A.I Realent Global Resources Ltd');
}

seedHutuListings();

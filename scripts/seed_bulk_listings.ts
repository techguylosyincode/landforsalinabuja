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

// Stock images for listings
const STOCK_IMAGES = [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop',
];

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// A.I Realent Listings - 30 properties across various districts
const aiRealentListings = [
    // GUZAPE - 5 listings
    { title: '500sqm Plot in Guzape District', district: 'guzape', price: 85000000, size: 500, titleType: 'C_of_O', features: ['Corner Piece', 'Tarred Road', 'Fenced'] },
    { title: '1000sqm Prime Land in Guzape', district: 'guzape', price: 180000000, size: 1000, titleType: 'C_of_O', features: ['Hilltop View', 'Fully Fenced', 'Near Channels TV'] },
    { title: '800sqm Residential Plot Guzape Zone 2', district: 'guzape', price: 120000000, size: 800, titleType: 'R_of_O', features: ['Gated Estate', 'Underground Drainage'] },
    { title: '600sqm Land for Sale Guzape Extension', district: 'guzape', price: 75000000, size: 600, titleType: 'R_of_O', features: ['New Layout', 'Access Road'] },
    { title: '1200sqm Premium Plot in Guzape', district: 'guzape', price: 250000000, size: 1200, titleType: 'C_of_O', features: ['Panoramic View', 'Prime Location', 'Verified'] },

    // MAITAMA - 5 listings
    { title: '2000sqm Plot in Maitama District', district: 'maitama', price: 850000000, size: 2000, titleType: 'C_of_O', features: ['Embassy Area', 'Fully Serviced', 'Prime'] },
    { title: '1500sqm Residential Land Maitama', district: 'maitama', price: 600000000, size: 1500, titleType: 'C_of_O', features: ['Near Hilton', 'Verified Title'] },
    { title: '1000sqm Land for Sale in Maitama', district: 'maitama', price: 450000000, size: 1000, titleType: 'C_of_O', features: ['Quiet Neighborhood', 'Secure Area'] },
    { title: '3000sqm Commercial Plot Maitama', district: 'maitama', price: 1200000000, size: 3000, titleType: 'C_of_O', features: ['Commercial Use', 'High Traffic', 'Verified'] },
    { title: '800sqm Prime Land Maitama Extension', district: 'maitama', price: 320000000, size: 800, titleType: 'C_of_O', features: ['New Development', 'Good Access'] },

    // ASOKORO - 5 listings
    { title: '1500sqm Plot in Asokoro District', district: 'asokoro', price: 550000000, size: 1500, titleType: 'C_of_O', features: ['Near Presidential Villa', 'Secure', 'Premium'] },
    { title: '2000sqm Residential Land Asokoro', district: 'asokoro', price: 780000000, size: 2000, titleType: 'C_of_O', features: ['Diplomatic Zone', 'Fully Fenced'] },
    { title: '1000sqm Land for Sale Asokoro Extension', district: 'asokoro', price: 350000000, size: 1000, titleType: 'R_of_O', features: ['New Area', 'Good Road Network'] },
    { title: '2500sqm Premium Plot in Asokoro', district: 'asokoro', price: 950000000, size: 2500, titleType: 'C_of_O', features: ['VIP Area', 'Verified', 'Hilltop'] },
    { title: '800sqm Affordable Plot Asokoro', district: 'asokoro', price: 280000000, size: 800, titleType: 'R_of_O', features: ['Budget Friendly', 'Developing Area'] },

    // LUGBE - 5 listings
    { title: '500sqm Land for Sale in Lugbe', district: 'lugbe', price: 15000000, size: 500, titleType: 'C_of_O', features: ['Near Airport', 'Tarred Road', 'Estate'] },
    { title: '1000sqm Plot Lugbe FHA', district: 'lugbe', price: 35000000, size: 1000, titleType: 'C_of_O', features: ['FHA Layout', 'Verified Title', 'Fenced'] },
    { title: '300sqm Affordable Land Lugbe', district: 'lugbe', price: 8000000, size: 300, titleType: 'R_of_O', features: ['Budget Option', 'Developing Estate'] },
    { title: '600sqm Residential Plot Lugbe', district: 'lugbe', price: 20000000, size: 600, titleType: 'R_of_O', features: ['Near Shoprite', 'Good Access'] },
    { title: '800sqm Corner Piece Lugbe Estate', district: 'lugbe', price: 28000000, size: 800, titleType: 'C_of_O', features: ['Corner Piece', 'Prime Location', 'Gated'] },

    // KATAMPE - 5 listings
    { title: '500sqm Plot in Katampe Extension', district: 'katampe', price: 55000000, size: 500, titleType: 'C_of_O', features: ['Diplomatic Zone', 'Serene', 'Verified'] },
    { title: '1000sqm Residential Land Katampe', district: 'katampe', price: 120000000, size: 1000, titleType: 'C_of_O', features: ['Hilltop', 'Panoramic View', 'Premium'] },
    { title: '700sqm Land for Sale Katampe Main', district: 'katampe', price: 60000000, size: 700, titleType: 'R_of_O', features: ['Established Area', 'Good Roads'] },
    { title: '1200sqm Prime Plot Katampe Extension', district: 'katampe', price: 180000000, size: 1200, titleType: 'C_of_O', features: ['Best Road Network', 'Verified', 'Premium'] },
    { title: '400sqm Affordable Plot Katampe', district: 'katampe', price: 35000000, size: 400, titleType: 'R_of_O', features: ['Entry Level', 'Good Investment'] },

    // IDU - 5 listings
    { title: '1000sqm Commercial Plot Idu Industrial', district: 'idu', price: 25000000, size: 1000, titleType: 'C_of_O', features: ['Industrial Use', 'Near Train Station', 'Verified'] },
    { title: '2000sqm Warehouse Land Idu', district: 'idu', price: 45000000, size: 2000, titleType: 'C_of_O', features: ['Heavy Duty Access', 'Industrial Zone'] },
    { title: '500sqm Residential Plot Idu Karmo', district: 'idu', price: 12000000, size: 500, titleType: 'R_of_O', features: ['Mixed Use', 'Developing Area'] },
    { title: '3000sqm Factory Land Idu Layout', district: 'idu', price: 75000000, size: 3000, titleType: 'C_of_O', features: ['Industrial Power', 'Wide Road', 'Prime'] },
    { title: '800sqm Commercial Plot Idu', district: 'idu', price: 20000000, size: 800, titleType: 'C_of_O', features: ['Near Airport Road', 'Good Visibility'] },
];

// Mshel Pent Haven Listings - 6 individual plots
const mshelPentHavenListings = [
    {
        title: '150sqm Land in Mshel Pent Haven Lugbe - 2 Bedroom Pent House',
        district: 'lugbe',
        price: 4788000,
        size: 150,
        titleType: 'R_of_O',
        image: '/images/properties/mshel-250sqm.jpg',
        features: ['Eco-Smart Estate', 'Gated Community', '24/7 Security', 'Children Park'],
        metaTitle: '150sqm Land for Sale Lugbe Airport Road | Mshel Pent Haven',
        metaDescription: 'Buy 150sqm land in Mshel Pent Haven, Lugbe for ₦4.78M. FCDA R of O title, gated estate, flexible payment plans. Perfect for 2 bedroom pent house.',
    },
    {
        title: '250sqm Land in Mshel Pent Haven Lugbe - 3 Bedroom Semi Detached',
        district: 'lugbe',
        price: 7980000,
        size: 250,
        titleType: 'R_of_O',
        image: '/images/properties/mshel-250sqm.jpg',
        features: ['Eco-Smart Estate', 'Gated Community', '24/7 Security', 'Recreation Area'],
        metaTitle: '250sqm Land for Sale Lugbe | Mshel Pent Haven Estate',
        metaDescription: 'Buy 250sqm land in Mshel Pent Haven, Lugbe for ₦7.98M. FCDA title, eco-smart estate near Airport Road. Ideal for 3 bedroom semi-detached.',
    },
    {
        title: '350sqm Land in Mshel Pent Haven Lugbe - 3 Bedroom Pent House',
        district: 'lugbe',
        price: 9575000,
        size: 350,
        titleType: 'R_of_O',
        image: '/images/properties/mshel-350sqm.jpg',
        features: ['Eco-Smart Estate', 'Gated Community', 'Central Generator', 'Family Garden'],
        metaTitle: '350sqm Plot for Sale Lugbe Airport Road | Mshel Pent Haven',
        metaDescription: 'Buy 350sqm land in Mshel Pent Haven for ₦9.58M. FCDA R of O, eco-smart gated estate in Lugbe. Perfect for 3 bedroom pent house.',
    },
    {
        title: '450sqm Land in Mshel Pent Haven Lugbe - 4 Bedroom Pent House',
        district: 'lugbe',
        price: 14362000,
        size: 450,
        titleType: 'R_of_O',
        image: '/images/properties/mshel-450sqm.jpg',
        features: ['Eco-Smart Estate', 'Gated Community', 'Commercial Space', 'Property Management'],
        metaTitle: '450sqm Land for Sale Lugbe | 4 Bedroom Pent House Plot',
        metaDescription: 'Buy 450sqm land in Mshel Pent Haven, Lugbe for ₦14.36M. FCDA title, eco-smart estate with amenities. Suitable for 4 bedroom pent house.',
    },
    {
        title: '750sqm Land in Mshel Pent Haven Lugbe - Block of Flats',
        district: 'lugbe',
        price: 23936000,
        size: 750,
        titleType: 'R_of_O',
        image: '/images/properties/mshel-750sqm.jpg',
        features: ['Eco-Smart Estate', 'Gated Community', 'Sport Area', 'Investment Grade'],
        metaTitle: '750sqm Plot for Sale Lugbe | Block of Flats Land',
        metaDescription: 'Buy 750sqm land in Mshel Pent Haven for ₦23.94M. FCDA R of O, near Airport Road. Ideal for 2 bedroom block of flats development.',
    },
    {
        title: '1000sqm Land in Mshel Pent Haven Lugbe - 3 Bedroom Block of Flat',
        district: 'lugbe',
        price: 31915000,
        size: 1000,
        titleType: 'R_of_O',
        image: '/images/properties/mshel-1000sqm.jpg',
        features: ['Eco-Smart Estate', 'Gated Community', 'Premium Plot', 'High ROI'],
        metaTitle: '1000sqm Land for Sale Lugbe Airport Road | Premium Estate',
        metaDescription: 'Buy 1000sqm land in Mshel Pent Haven for ₦31.92M. FCDA approved, eco-smart estate in Lugbe. Perfect for 3 bedroom block of flats.',
    },
];

const mshelDescription = `
Mshel Pent Haven is designed for those who value Greenery, Space, Lifestyle and Lasting Returns.

Located strategically on Airport Road, Lugbe, this 282.46 hectares eco-smart estate offers unmatched value for investors and homeowners.

ESTATE AMENITIES:
• Gated Community with Controlled Access (24/7)
• Property Management and Maintenance Team
• Recreation and Sport Area
• Commercial Space
• Central Generator
• Children Park and Family Garden
• Eco-Smart Infrastructure

NEARBY LANDMARKS:
• Innovatech Farms
• Ebikay's Kitchen
• Gonaco Enterprises
• ACO Quarry
• Arizona Concept

DOCUMENTATION:
• Before Payment: Offer Letter
• After Initial Deposit: Payment Receipt & Provisional Allocation
• Final Payment: Allocation Letter & Final Receipt

TITLE: FCDA R of O (Right of Occupancy)

Flexible payment plans available: 4, 8, 12, and 18-month options.

📍 Pin Location: https://goo.gl/maps/iMyEEewUrwLhey4f8
`;

async function seedBulkListings() {
    console.log('Starting bulk listing creation...\n');

    // 1. Insert A.I Realent Listings
    console.log('Creating 30 A.I Realent listings...');

    for (let i = 0; i < aiRealentListings.length; i++) {
        const listing = aiRealentListings[i];
        const slug = slugify(listing.title) + '-' + Date.now().toString().slice(-4) + i;

        const property = {
            title: listing.title,
            slug: slug,
            district: listing.district,
            address: `${listing.district.charAt(0).toUpperCase() + listing.district.slice(1)} District, Abuja FCT`,
            price: listing.price,
            size_sqm: listing.size,
            title_type: listing.titleType,
            description: `Premium ${listing.size}sqm plot available in ${listing.district.charAt(0).toUpperCase() + listing.district.slice(1)} District, Abuja. This verified land comes with ${listing.titleType} documentation and is ready for immediate development. Features include: ${listing.features.join(', ')}. Contact A.I Realent Global Resources for inspection and purchase.`,
            features: listing.features,
            images: [STOCK_IMAGES[i % STOCK_IMAGES.length]],
            status: 'active',
            agent_id: AI_REALENT_AGENT_ID,
            meta_title: `${listing.title} | A.I Realent`,
            meta_description: `Buy ${listing.size}sqm land in ${listing.district} for ₦${listing.price.toLocaleString()}. ${listing.titleType} title. Verified by A.I Realent Global Resources.`,
        };

        const { error } = await supabase.from('properties').insert(property);

        if (error) {
            console.error(`Error inserting ${listing.title}:`, error.message);
        } else {
            console.log(`✓ Created: ${listing.title}`);
        }
    }

    // 2. Insert Mshel Pent Haven Listings
    console.log('\nCreating 6 Mshel Pent Haven listings...');

    for (let i = 0; i < mshelPentHavenListings.length; i++) {
        const listing = mshelPentHavenListings[i];
        const slug = slugify(listing.title) + '-mshel';

        const property = {
            title: listing.title,
            slug: slug,
            district: listing.district,
            address: 'Mshel Pent Haven Estate, Airport Road, Lugbe, Abuja FCT',
            price: listing.price,
            size_sqm: listing.size,
            title_type: listing.titleType,
            description: mshelDescription,
            features: listing.features,
            images: [listing.image],
            status: 'active',
            agent_id: AI_REALENT_AGENT_ID,
            meta_title: listing.metaTitle,
            meta_description: listing.metaDescription,
        };

        const { error } = await supabase.from('properties').insert(property);

        if (error) {
            console.error(`Error inserting ${listing.title}:`, error.message);
        } else {
            console.log(`✓ Created: ${listing.title}`);
        }
    }

    console.log('\n✅ Bulk listing complete!');
    console.log(`Total A.I Realent listings: ${aiRealentListings.length}`);
    console.log(`Total Mshel Pent Haven listings: ${mshelPentHavenListings.length}`);
}

seedBulkListings();

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

// A.I Realent Listings - 30 properties across various districts
const aiRealentListings = [
    // GUZAPE - 5 listings
    { title: '500sqm Plot in Guzape District', district: 'guzape', price: 85000000, size: 500, titleType: 'C_of_O', features: ['Corner Piece', 'Tarred Road', 'Fenced'], type: 'residential' },
    { title: '1000sqm Prime Land in Guzape', district: 'guzape', price: 180000000, size: 1000, titleType: 'C_of_O', features: ['Hilltop View', 'Fully Fenced', 'Near Channels TV'], type: 'residential' },
    { title: '2000sqm Commercial Plot Guzape', district: 'guzape', price: 450000000, size: 2000, titleType: 'C_of_O', features: ['Main Road', 'Commercial Approval', 'High Density'], type: 'commercial' },
    { title: '600sqm Land for Sale Guzape Extension', district: 'guzape', price: 75000000, size: 600, titleType: 'R_of_O', features: ['New Layout', 'Access Road'], type: 'residential' },
    { title: '1200sqm Premium Plot in Guzape', district: 'guzape', price: 250000000, size: 1200, titleType: 'C_of_O', features: ['Panoramic View', 'Prime Location', 'Verified'], type: 'residential' },

    // MAITAMA - 5 listings
    { title: '2000sqm Plot in Maitama District', district: 'maitama', price: 850000000, size: 2000, titleType: 'C_of_O', features: ['Embassy Area', 'Fully Serviced', 'Prime'], type: 'residential' },
    { title: '1500sqm Residential Land Maitama', district: 'maitama', price: 600000000, size: 1500, titleType: 'C_of_O', features: ['Near Hilton', 'Verified Title'], type: 'residential' },
    { title: '1000sqm Land for Sale in Maitama', district: 'maitama', price: 450000000, size: 1000, titleType: 'C_of_O', features: ['Quiet Neighborhood', 'Secure Area'], type: 'residential' },
    { title: '3000sqm Commercial Plot Maitama', district: 'maitama', price: 1200000000, size: 3000, titleType: 'C_of_O', features: ['Commercial Use', 'High Traffic', 'Verified'], type: 'commercial' },
    { title: '800sqm Prime Land Maitama Extension', district: 'maitama', price: 320000000, size: 800, titleType: 'C_of_O', features: ['New Development', 'Good Access'], type: 'residential' },

    // ASOKORO - 5 listings
    { title: '1500sqm Plot in Asokoro District', district: 'asokoro', price: 550000000, size: 1500, titleType: 'C_of_O', features: ['Near Presidential Villa', 'Secure', 'Premium'], type: 'residential' },
    { title: '2000sqm Residential Land Asokoro', district: 'asokoro', price: 780000000, size: 2000, titleType: 'C_of_O', features: ['Diplomatic Zone', 'Fully Fenced'], type: 'residential' },
    { title: '1000sqm Land for Sale Asokoro Extension', district: 'asokoro', price: 350000000, size: 1000, titleType: 'R_of_O', features: ['New Area', 'Good Road Network'], type: 'residential' },
    { title: '2500sqm Premium Plot in Asokoro', district: 'asokoro', price: 950000000, size: 2500, titleType: 'C_of_O', features: ['VIP Area', 'Verified', 'Hilltop'], type: 'residential' },
    { title: '800sqm Affordable Plot Asokoro', district: 'asokoro', price: 280000000, size: 800, titleType: 'R_of_O', features: ['Budget Friendly', 'Developing Area'], type: 'residential' },

    // LUGBE - 5 listings
    { title: '500sqm Land for Sale in Lugbe', district: 'lugbe', price: 15000000, size: 500, titleType: 'C_of_O', features: ['Near Airport', 'Tarred Road', 'Estate'], type: 'residential' },
    { title: '1000sqm Plot Lugbe FHA', district: 'lugbe', price: 35000000, size: 1000, titleType: 'C_of_O', features: ['FHA Layout', 'Verified Title', 'Fenced'], type: 'residential' },
    { title: '300sqm Affordable Land Lugbe', district: 'lugbe', price: 8000000, size: 300, titleType: 'R_of_O', features: ['Budget Option', 'Developing Estate'], type: 'residential' },
    { title: 'Airport Road Commercial Plot', district: 'lugbe', price: 150000000, size: 2000, titleType: 'R_of_O', features: ['Highway Facing', 'Filling Station Potential'], type: 'commercial' },
    { title: '800sqm Corner Piece Lugbe Estate', district: 'lugbe', price: 28000000, size: 800, titleType: 'C_of_O', features: ['Corner Piece', 'Prime Location', 'Gated'], type: 'residential' },

    // KATAMPE - 5 listings
    { title: '500sqm Plot in Katampe Extension', district: 'katampe', price: 55000000, size: 500, titleType: 'C_of_O', features: ['Diplomatic Zone', 'Serene', 'Verified'], type: 'residential' },
    { title: '1000sqm Residential Land Katampe', district: 'katampe', price: 120000000, size: 1000, titleType: 'C_of_O', features: ['Hilltop', 'Panoramic View', 'Premium'], type: 'residential' },
    { title: '700sqm Land for Sale Katampe Main', district: 'katampe', price: 60000000, size: 700, titleType: 'R_of_O', features: ['Established Area', 'Good Roads'], type: 'residential' },
    { title: '1200sqm Prime Plot Katampe Extension', district: 'katampe', price: 180000000, size: 1200, titleType: 'C_of_O', features: ['Best Road Network', 'Verified', 'Premium'], type: 'residential' },
    { title: '400sqm Affordable Plot Katampe', district: 'katampe', price: 35000000, size: 400, titleType: 'R_of_O', features: ['Entry Level', 'Good Investment'], type: 'residential' },

    // IDU - 5 listings
    { title: '5 Hectares Industrial Land Idu', district: 'idu', price: 800000000, size: 50000, titleType: 'C_of_O', features: ['Rail Access', 'Factory Zone', 'Power Supply'], type: 'industrial' },
    { title: '2000sqm Warehouse Land Idu', district: 'idu', price: 45000000, size: 2000, titleType: 'C_of_O', features: ['Heavy Duty Access', 'Industrial Zone'], type: 'industrial' },
    { title: '1000sqm Mixed Use Idu', district: 'idu', price: 25000000, size: 1000, titleType: 'R_of_O', features: ['Near Train Station', 'Fenced'], type: 'mixed' },
    { title: '3000sqm Factory Land Idu Layout', district: 'idu', price: 75000000, size: 3000, titleType: 'C_of_O', features: ['Industrial Power', 'Wide Road', 'Prime'], type: 'industrial' },
    { title: '800sqm Commercial Plot Idu', district: 'idu', price: 20000000, size: 800, titleType: 'C_of_O', features: ['Near Airport Road', 'Good Visibility'], type: 'commercial' },
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
`;

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}


async function seedBulkListings() {
    // 1. Insert A.I Realent Listings
    console.log('Creating A.I Realent listings...');

    for (let i = 0; i < aiRealentListings.length; i++) {
        const listing = aiRealentListings[i];
        const slug = slugify(listing.title);

        // Add Payment Plan to features for expensive plots
        const features = [...listing.features];
        if (listing.price > 50000000) {
            features.push('Payment Plan');
        }

        const property = {
            title: listing.title,
            slug: slug,
            district: listing.district,
            address: `${listing.district} District, Abuja`,
            price: listing.price,
            size_sqm: listing.size,
            title_type: listing.titleType,
            description: `Premium ${listing.size}sqm plot in ${listing.district}. Features: ${features.join(', ')}.`,
            features: features,
            images: [STOCK_IMAGES[Math.floor(Math.random() * STOCK_IMAGES.length)]],
            status: 'active',
            agent_id: AI_REALENT_AGENT_ID,
            type: listing.type,
        };

        const { error } = await supabase.from('properties').insert(property);

        if (error) {
            console.error(`Error inserting ${listing.title}: `, error.message);
        } else {
            console.log(`✓ Created: ${listing.title}`);
        }
    }

    // 2. Insert Mshel Pent Haven Listings
    console.log('\nCreating 6 Mshel Pent Haven listings...');

    for (let i = 0; i < mshelPentHavenListings.length; i++) {
        const listing = mshelPentHavenListings[i];
        const slug = slugify(listing.title) + '-mshel';

        // Add Payment Plan to features
        const features = [...listing.features, 'Payment Plan'];

        const property = {
            title: listing.title,
            slug: slug,
            district: listing.district,
            address: 'Mshel Pent Haven Estate, Airport Road, Lugbe, Abuja FCT',
            price: listing.price,
            size_sqm: listing.size,
            title_type: listing.titleType,
            description: mshelDescription,
            features: features,
            images: [listing.image],
            status: 'active',
            agent_id: AI_REALENT_AGENT_ID,
            meta_title: listing.metaTitle,
            meta_description: listing.metaDescription,
        };

        const { error } = await supabase.from('properties').insert(property);

        if (error) {
            console.error(`Error inserting ${listing.title}: `, error.message);
        } else {
            console.log(`✓ Created: ${listing.title} `);
        }
    }

    console.log('\n✅ Bulk listing complete!');
    console.log(`Total A.I Realent listings: ${aiRealentListings.length} `);
    console.log(`Total Mshel Pent Haven listings: ${mshelPentHavenListings.length} `);
}

seedBulkListings();

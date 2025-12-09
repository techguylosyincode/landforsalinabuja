import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_PROPERTIES = [
    {
        title: "Prime Residential Plot in Guzape",
        description: "A fully fenced residential plot in the heart of Guzape. Perfect for a luxury duplex. The area is fully developed with tarred roads and electricity. C of O is available and verifiable. Features: Fenced, Tarred Road, Electricity.",
        price: 45000000,
        size_sqm: 600,
        district: "Guzape",
        address: "Plot 123, Diplomatic Zone, Guzape, Abuja",
        title_type: "C_of_O",
        status: "active",
        images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"],
        slug: "prime-residential-plot-guzape",
        is_featured: true
    },
    {
        title: "Commercial Plot in Maitama",
        description: "High-value commercial land suitable for a plaza or corporate headquarters. Located on a major road with high foot traffic.",
        price: 350000000,
        size_sqm: 1200,
        district: "Maitama",
        address: "Plot 55, Gana Street, Maitama, Abuja",
        title_type: "C_of_O",
        status: "active",
        images: ["https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1000&auto=format&fit=crop"],
        slug: "commercial-plot-maitama",
        is_featured: true
    },
    {
        title: "Affordable Land in Lugbe",
        description: "Great investment opportunity in a rapidly developing area. Close to the airport road.",
        price: 8000000,
        size_sqm: 450,
        district: "Lugbe",
        address: "Lugbe 1 Extension, Abuja",
        title_type: "R_of_O",
        status: "active",
        images: ["https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=1000&auto=format&fit=crop"],
        slug: "affordable-land-lugbe",
        is_featured: true
    }
];

const SAMPLE_BLOG_POSTS = [
    {
        title: "How to Verify C of O in Abuja",
        slug: "how-to-verify-c-of-o-abuja",
        content: "<p>Buying land in Abuja requires due diligence. The most important step is verifying the Certificate of Occupancy (C of O).</p><h3>Step 1: Visit AGIS</h3><p>Go to the Abuja Geographic Information Systems (AGIS) office...</p>",
        published: true
    },
    {
        title: "Top 5 Developing Areas in Abuja for 2025",
        slug: "top-developing-areas-abuja-2025",
        content: "<p>Abuja is expanding rapidly. Here are the top areas to watch: Idu, Karmo, and Lugbe...</p>",
        published: true
    }
];

async function seed() {
    console.log('Seeding database...');

    // 1. Create Dummy Agent User
    const email = `agent-${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Creating agent user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Error creating auth user:', authError);
        // If user already exists, try to sign in or just proceed if we can't
        // But for seed, we want a fresh user or handle existing.
        // Let's just log and return if critical.
        // return; 
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error('No user ID returned (maybe email confirmation required? or user exists)');
        // If user exists, we can't get ID easily without login.
        // For this demo, let's assume success or check console.
        // If we can't get ID, we can't insert properties with agent_id.
        // We might need to fetch an existing user if we knew credentials.
        // Let's hope signUp works (it should for new email).
    }

    if (userId) {
        // 2. Create Profile for Agent
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                role: 'agent',
                full_name: 'Seed Agent',
                agency_name: 'Abuja Prime Lands',
                phone_number: '08001234567',
                is_verified: true,
                subscription_tier: 'premium'
            });

        if (profileError) {
            console.error('Error creating profile:', profileError);
        }

        // 3. Insert Properties
        const propertiesWithAgent = SAMPLE_PROPERTIES.map(p => ({
            ...p,
            agent_id: userId
        }));

        const { error: propError } = await supabase
            .from('properties')
            .insert(propertiesWithAgent);

        if (propError) {
            console.error('Error inserting properties:', propError);
        } else {
            console.log('Properties inserted successfully.');
        }
    } else {
        console.log("Skipping property insertion due to missing user ID");
    }

    // 4. Insert Blog Posts
    // Blog posts have author_id which is nullable in schema?
    // Schema: author_id uuid references profiles(id) on delete set null
    // We can insert without author_id or use userId if available.
    const blogPostsWithAuthor = SAMPLE_BLOG_POSTS.map(p => ({
        ...p,
        author_id: userId || null
    }));

    const { error: blogError } = await supabase
        .from('blog_posts')
        .insert(blogPostsWithAuthor);

    if (blogError) {
        console.error('Error inserting blog posts:', blogError);
    } else {
        console.log('Blog posts inserted successfully.');
    }
}

seed();

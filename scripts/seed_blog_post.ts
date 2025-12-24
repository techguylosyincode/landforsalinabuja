import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const blogPost = {
  title: "How to Verify Land Title in Abuja: A Complete Guide (2025)",
  slug: "how-to-verify-land-title-in-abuja",
  category: "Guide",
  excerpt: "Don't get scammed. Learn the step-by-step process to verify land titles in Abuja, from AGIS search to physical inspection. Essential guide for 2025 investors.",
  image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop",
  meta_title: "How to Verify Land Title in Abuja | AGIS Search & Due Diligence",
  meta_description: "Step-by-step guide to verifying land titles in Abuja. Learn how to conduct an AGIS search, spot fake C of Os, and avoid real estate scams in 2025.",
  published: true,
  content: `
    <article class="prose lg:prose-xl mx-auto">
      <p class="lead text-xl text-gray-600 mb-8"><strong>Imagine paying ₦50 million for a prime plot of land in Guzape, only to discover six months later that the "owner" was a fraudster, the C of O was forged, and the real owner is now suing you.</strong></p>
      
      <p>It’s a nightmare scenario that plays out far too often in the Abuja real estate market. As the Federal Capital Territory (FCT) continues to expand into districts like Idu, Katampe Extension, and Lugbe, land scams have evolved. They are no longer just about selling "air"; they involve sophisticated forgery, identity theft, and double allocations that can fool even experienced investors.</p>
      
      <p>However, buying land in Abuja remains one of the most profitable investments in Nigeria. The key to unlocking this wealth without losing your capital lies in one word: <strong>Verification</strong>.</p>
      
      <p>In this comprehensive guide, drawing from over a decade of experience in the FCT real estate market, we will walk you through the exact, non-negotiable step-by-step process to <strong>verify land titles in Abuja</strong>. By the end of this article, you will know exactly how to spot a fake C of O, how to conduct a legal search at AGIS, and how to ensure your investment is 100% secure.</p>

      <h2>Why Land Verification in Abuja is Non-Negotiable</h2>
      <p>Abuja is unique. Unlike Lagos or other states, all land in the FCT is vested in the Federal Government and administered by the Federal Capital Territory Administration (FCTA). This centralized system is designed to be orderly, but high demand has bred a black market of opportunists.</p>
      
      <p>The risks of skipping due diligence are catastrophic:</p>
      <ul>
        <li><strong>Fake Documents:</strong> High-quality forgeries of Certificates of Occupancy (C of O) are in circulation.</li>
        <li><strong>Multiple Allocations:</strong> A single plot might have been "allocated" to three different people due to administrative errors or corruption in the past.</li>
        <li><strong>Government Acquisition:</strong> You might buy land that sits on a sewage line, a green area, or a future highway. These structures will be demolished without compensation.</li>
        <li><strong>Pending Litigation:</strong> The land might be the subject of a bitter family dispute or a court injunction that prevents transfer.</li>
      </ul>
      <p><strong>The Golden Rule:</strong> Trust no one. Verify everything. Even if you are buying from a close friend or a "reputable" estate agent, you must conduct your own independent verification.</p>

      <h2>Understanding Abuja Land Documents: C of O vs. R of O</h2>
      <p>Before you verify, you must understand what you are looking at. In the FCT, land titles generally fall into a few specific categories. Knowing the difference can save you millions.</p>
      
      <h3>1. Certificate of Occupancy (C of O)</h3>
      <p>This is the gold standard of land ownership in Abuja. It is a legal document issued by the government that proves ownership for 99 years. A C of O is recertified and digitized. If a seller claims to have a C of O, verification is straightforward but mandatory.</p>

      <h3>2. Right of Occupancy (R of O)</h3>
      <p>This is an offer of land details. It usually precedes the C of O. Many genuine plots in developing areas like Idu, Karmo, or Lugbe come with an R of O. It is a valid title, but you must confirm that the owner has paid all relevant bills and that the file is open for "recertification" (the process of converting R of O to C of O).</p>

      <h3>3. Allocation Letter</h3>
      <p>This is common for mass housing schemes or estate plots. While valid, these are riskier if not backed by a global C of O for the estate. You are essentially buying a "sub-lease" from the estate developer, not directly from the government.</p>

      <h3>4. Deed of Assignment / Power of Attorney</h3>
      <p>These are transaction documents, not title documents. They prove that ownership was transferred from Mr. A to Mr. B. They must be registered with AGIS to be legally binding against third parties.</p>

      <h2>Step 1: The Preliminary Investigation (The "Soft" Search)</h2>
      <p>Before you even spend money on a lawyer or surveyor, do your own homework.</p>
      <ul>
        <li><strong>Ask for the Data:</strong> Request a copy of the title document. If the seller refuses to send a copy (even with sensitive info redacted) or insists on "payment before verification," walk away immediately.</li>
        <li><strong>Check the Name:</strong> Does the name on the document match the person selling? If not, do they have a registered Power of Attorney?</li>
        <li><strong>Google Earth Check:</strong> Use the plot number and district to get a rough idea of the location. Is it in a developed area? Is it in a swamp?</li>
      </ul>

      <h2>Step 2: The Physical Inspection (The "Hard" Look)</h2>
      <p>Never, ever buy land in Abuja without seeing it. If you are in the diaspora, you must send a trusted representative or a qualified surveyor. Do not rely solely on videos sent by the agent.</p>
      
      <p><strong>What to look for during inspection:</strong></p>
      <ul>
        <li><strong>Beacons:</strong> Are the corner pieces (beacons) clearly marked with concrete? Do the numbers on the beacons match the site plan?</li>
        <li><strong>Topography and Soil:</strong> Is the land waterlogged? Is it on a steep rocky hill? These factors can double your building cost. A cheap plot on a rock is expensive in the long run.</li>
        <li><strong>Possession:</strong> Is there any sign of farming, fencing, or makeshift structures? This could indicate a squatter or a competing claim. "Buying a lawsuit" is a common trap.</li>
        <li><strong>Coordinates:</strong> This is critical. Go with a surveyor to pick the GPS coordinates of the beacons. You will need these for the AGIS search to confirm the land hasn't shifted on paper.</li>
      </ul>

      <h2>Step 3: Conducting a Legal Search at AGIS</h2>
      <p>The <strong>Abuja Geographic Information Systems (AGIS)</strong> is the only authority that can confirm the status of land in the FCC (Federal Capital City). This is the most critical step.</p>
      
      <p><strong>The Process:</strong></p>
      <ol>
        <li><strong>Legal Search Application:</strong> Your lawyer applies for a "Legal Search" at AGIS using the plot details (File Number, Plot Number, Cadastral Zone). You will pay a processing fee.</li>
        <li><strong>Verify Ownership:</strong> The search result will reveal the current registered owner. If it doesn't match the seller's name, and there is no registered chain of transfer, it is a red flag.</li>
        <li><strong>Check Encumbrances:</strong> The report will show if there are any caveats (warnings), mortgages (land used as collateral), or court injunctions on the land. You cannot buy land that has a court case on it.</li>
        <li><strong>Verify Land Use Purpose:</strong> Ensure the land use (Residential, Commercial, Mixed-Use) matches your intended purpose. You cannot build a hotel on land designated for residential use without a difficult and expensive "Change of Purpose" process.</li>
        <li><strong>Check for Double Allocation:</strong> The search confirms that the file is unique and not cloned.</li>
      </ol>

      <h2>Step 4: Corporate and Identity Verification</h2>
      <p>Verification doesn't stop at AGIS. You must verify the seller.</p>
      <ul>
        <li><strong>Individual Seller:</strong> Check their international passport or NIN. Does the face match? Does the signature match the documents?</li>
        <li><strong>Corporate Seller:</strong> If the land is owned by a company, you must conduct a search at the <strong>Corporate Affairs Commission (CAC)</strong>. You need to confirm:
          <ul>
            <li>The company exists and is active.</li>
            <li>The person selling is a Director or Secretary authorized to sell.</li>
            <li>There is a board resolution authorizing the sale of that specific asset.</li>
          </ul>
        </li>
        <li><strong>Inherited Land:</strong> If the owner is deceased, you must ask for the <strong>Letter of Administration</strong> or <strong>Probate</strong>. You cannot buy land from "the son" without legal authority from the court.</li>
      </ul>

      <h2>Step 5: The Transaction Process</h2>
      <p>Once verification is successful, follow this safe transaction process:</p>
      <ol>
        <li><strong>Offer Letter:</strong> The seller issues an offer letter stating the price and terms.</li>
        <li><strong>Deed of Assignment:</strong> Your lawyer drafts a Deed of Assignment. Do not use a generic template; ensure it protects your interests.</li>
        <li><strong>Payment:</strong> Pay via bank transfer to the owner's account (or the company account). <strong>Never pay cash.</strong> The bank trail is your evidence.</li>
        <li><strong>Exchange of Documents:</strong> Upon payment, you receive the original title documents, the signed Deed of Assignment, and the Power of Attorney.</li>
        <li><strong>Registration:</strong> Immediately take these documents to AGIS to register the transaction and start the process of changing the name to yours (Governor's Consent).</li>
      </ol>

      <h2>Common Scams to Avoid in 2025</h2>
      <div class="bg-red-50 p-6 rounded-lg border border-red-100 my-6">
        <h4 class="text-red-800 font-bold mb-2">⚠️ Warning Signs</h4>
        <ul class="list-disc list-inside text-red-700 space-y-2">
          <li><strong>"Urgent Distress Sale":</strong> Scammers often use urgency ("The owner is travelling tomorrow!") to bypass verification. Real estate transactions take time.</li>
          <li><strong>Refusal to Meet at AGIS:</strong> If the seller won't meet you or your lawyer at AGIS for "sight of original," it's a scam.</li>
          <li><strong>"File is at the Minister's Office":</strong> This is a common lie to explain why a search cannot be conducted. If you can't search it, don't buy it.</li>
          <li><strong>Price Too Good to Be True:</strong> A plot in Maitama for ₦50 million is impossible. Know the market value. If it's cheap, there's a problem.</li>
        </ul>
      </div>

      <h2>Conclusion</h2>
      <p>Verifying land title in Abuja requires patience, diligence, and a bit of money for professional fees. However, it is the only way to safeguard your investment. The cost of a surveyor and a legal search is a tiny fraction—often less than 1%—of the cost of losing your entire capital to a scam.</p>
      <p>At <strong>LandForSaleInAbuja.ng</strong>, we are committed to transparency. All listings on our platform go through a preliminary vetting process, but we still strongly encourage every buyer to conduct their own independent due diligence using the steps outlined above. Your peace of mind is worth it.</p>
      
      <p class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"><strong>Ready to find genuine, verifiable land?</strong> <a href="/buy" class="text-primary font-bold hover:underline">Browse our verified listings in Abuja today</a> and invest with confidence.</p>

      <hr class="my-8" />

      <h2>Frequently Asked Questions (FAQs)</h2>
      
      <div class="space-y-6">
        <div>
          <h3 class="font-bold text-lg">How long does an AGIS search take?</h3>
          <p>Typically, a legal search at AGIS takes between 24 to 48 hours, depending on the workload and system availability. It is a quick process that saves you years of trouble.</p>
        </div>
        
        <div>
          <h3 class="font-bold text-lg">Can I verify land online in Abuja?</h3>
          <p>Currently, there is no public online portal for comprehensive land verification in Abuja. You must visit AGIS physically (at No. 4 Peace Drive, Area 11, Garki) or send a lawyer to conduct the search officially.</p>
        </div>
        
        <div>
          <h3 class="font-bold text-lg">What is the difference between C of O and R of O?</h3>
          <p>An R of O (Right of Occupancy) is an offer of land, while a C of O (Certificate of Occupancy) is the supreme evidence of ownership issued after the R of O conditions are met and fees paid. Both are valid, but a C of O is stronger and preferred by banks for collateral.</p>
        </div>
        
        <div>
          <h3 class="font-bold text-lg">How much does land verification cost in Abuja?</h3>
          <p>The official AGIS search fee is relatively low (around ₦10,000 - ₦20,000), but you will pay legal fees to your lawyer for the service, which can range from ₦50,000 to ₦150,000 depending on the complexity and the lawyer's standing.</p>
        </div>
      </div>
    </article>
  `
};

async function seed() {
  console.log('Seeding blog post...');

  // Check if post exists
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', blogPost.slug)
    .single();

  if (existing) {
    console.log('Post already exists, updating...');
    const { error } = await supabase
      .from('blog_posts')
      .update(blogPost)
      .eq('id', existing.id);

    if (error) console.error('Error updating post:', error);
    else console.log('Post updated successfully!');
  } else {
    console.log('Creating new post...');
    const { error } = await supabase
      .from('blog_posts')
      .insert([blogPost]);

    if (error) console.error('Error creating post:', error);
    else console.log('Post created successfully!');
  }
}

seed();

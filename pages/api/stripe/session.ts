import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabaseClient'; // Adjust path as needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Placeholder for your actual Price IDs from your Stripe Dashboard
const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PLAN_PRICE_ID || 'price_pro_placeholder', // e.g., price_1PEXAMPLEPRO
  team: process.env.STRIPE_TEAM_PLAN_PRICE_ID || 'price_team_placeholder', // e.g., price_1PEXAMPLETEAM
};

if (STRIPE_PRICE_IDS.pro === 'price_pro_placeholder' || STRIPE_PRICE_IDS.team === 'price_team_placeholder') {
  console.warn("Warning: Stripe Price IDs are using placeholder values. Update them in your environment variables.");
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { planId, userId } = req.body; // planId could be 'pro', 'team', etc. userId from your auth system.

  if (!planId || typeof planId !== 'string' || !STRIPE_PRICE_IDS[planId as keyof typeof STRIPE_PRICE_IDS]) {
    return res.status(400).json({ error: 'Invalid or missing plan ID.' });
  }

  if (!userId) {
    // In a real app, you'd get this from an authenticated session (e.g. JWT, Supabase auth)
    // For this example, we expect it in the body.
    return res.status(400).json({ error: 'User ID is required.' });
  }

  // Fetch user to get their email and potentially existing Stripe customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('email, stripe_customer_id')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error('Error fetching user or user not found:', userError);
    return res.status(404).json({ error: 'User not found.' });
  }

  let stripeCustomerId = user.stripe_customer_id;

  // If the user doesn't have a Stripe customer ID, create one
  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          app_user_id: userId, // Link Stripe customer to your app's user ID
        },
      });
      stripeCustomerId = customer.id;

      // Save the new Stripe customer ID to your Supabase user table
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);

      if (updateError) {
        console.error('Error saving Stripe customer ID to user:', updateError);
        // Proceed with session creation, but log this error
      }
    } catch (e: any) {
      console.error('Error creating Stripe customer:', e.message);
      return res.status(500).json({ error: `Error creating Stripe customer: ${e.message}` });
    }
  }


  try {
    const priceId = STRIPE_PRICE_IDS[planId as keyof typeof STRIPE_PRICE_IDS];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // For recurring payments
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: stripeCustomerId, // Use existing or newly created Stripe customer ID
      client_reference_id: userId.toString(), // Your app's user ID
      metadata: {
        app_user_id: userId.toString(), // For webhook reference
        stripe_price_id: priceId, // The specific price ID chosen
        app_plan_identifier: planId, // e.g., 'pro', 'team'
      },
      success_url: `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/payment/cancelled`,
      // automatic_tax: { enabled: true }, // Consider enabling if you handle taxes
      // customer_update: { address: 'auto' }, // Allow customer to update address
    });

    if (session.url) {
      res.status(200).json({ sessionId: session.id, url: session.url });
    } else {
      res.status(500).json({ error: 'Failed to create Stripe session.' });
    }
  } catch (e: any) {
    console.error('Stripe session creation error:', e.message);
    res.status(500).json({ error: `Stripe error: ${e.message}` });
  }
}

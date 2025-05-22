import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Readable } from 'node:stream';
import { supabase } from '../../../lib/supabaseClient'; // Adjust path as needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

if (!webhookSecret) {
  console.error("CRITICAL: Stripe Webhook Secret (STRIPE_WEBHOOK_SECRET) is not set. Webhook will not function.");
}

// Helper function to buffer request body
async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Disable Next.js body parsing for this route, as Stripe needs the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  if (!webhookSecret) {
    console.error("Stripe webhook secret not configured.");
    return res.status(500).json({ error: "Stripe webhook secret not configured." });
  }

  const sig = req.headers['stripe-signature'] as string;
  const reqBuffer = await buffer(req);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received Stripe event: ${event.type}`, event.data.object);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const appUserId = session.client_reference_id || session.metadata?.app_user_id;
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const appPlanIdentifier = session.metadata?.app_plan_identifier; // e.g., 'pro', 'team'

        if (!appUserId) {
          console.error('Webhook Error: Missing app_user_id (client_reference_id or metadata.app_user_id) in checkout.session.completed');
          return res.status(400).json({ error: 'Missing user identifier in session.' });
        }
        if (!stripeCustomerId) {
            console.error('Webhook Error: Missing stripe_customer_id in checkout.session.completed');
            return res.status(400).json({ error: 'Missing Stripe customer identifier in session.' });
        }
        if (!stripeSubscriptionId) {
            console.error('Webhook Error: Missing stripe_subscription_id in checkout.session.completed');
            return res.status(400).json({ error: 'Missing Stripe subscription identifier in session.' });
        }
        if (!appPlanIdentifier) {
            console.error('Webhook Error: Missing app_plan_identifier in session metadata for checkout.session.completed');
            return res.status(400).json({ error: 'Missing app plan identifier in session metadata.' });
        }

        // Update user record in Supabase
        // We use the 'role' field to store the plan type (e.g., 'pro', 'team')
        // We also store stripe_customer_id and a new field stripe_subscription_id
        const { error } = await supabase
          .from('users')
          .update({
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId, // You might need to add this column
            role: appPlanIdentifier, // Assuming 'pro' or 'team' matches your role names
            // current_plan_price_id: session.metadata?.stripe_price_id, // Optionally store this too
          })
          .eq('id', appUserId);

        if (error) {
          console.error(`Webhook: Error updating user ${appUserId} for checkout.session.completed:`, error);
          // Don't return 500 to Stripe if DB fails, Stripe will retry.
          // Log it and investigate.
        } else {
          console.log(`Webhook: User ${appUserId} updated for plan ${appPlanIdentifier} after checkout.session.completed.`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const appUserId = subscription.metadata?.app_user_id; // Ensure you set this when creating subscription/customer
        
        // Determine the new plan/role based on the price ID
        // This requires mapping Stripe Price IDs back to your application's plan identifiers ('pro', 'team')
        // For simplicity, let's assume the first item's price ID is the primary one.
        const priceId = subscription.items.data[0]?.price.id;
        let newPlanRole = ''; // Determine this based on priceId mapping
        
        // Example mapping (you'd need to fetch this from your DB or config)
        const STRIPE_PRICE_IDS_TO_APP_PLAN = {
            [process.env.STRIPE_PRO_PLAN_PRICE_ID!]: 'pro',
            [process.env.STRIPE_TEAM_PLAN_PRICE_ID!]: 'team',
            // Add other price IDs if they exist (e.g. annual versions)
        };
        newPlanRole = STRIPE_PRICE_IDS_TO_APP_PLAN[priceId as keyof typeof STRIPE_PRICE_IDS_TO_APP_PLAN] || 'user'; // Default to basic user role

        if (subscription.status === 'active') {
          const { error } = await supabase
            .from('users')
            .update({
              role: newPlanRole,
              stripe_subscription_id: subscription.id,
              // current_plan_price_id: priceId,
            })
            .eq(appUserId ? 'id' : 'stripe_customer_id', appUserId || stripeCustomerId); // Match on app_user_id if available

          if (error) {
            console.error(`Webhook: Error updating user for customer.subscription.updated (active):`, error);
          } else {
            console.log(`Webhook: User subscription updated to ${newPlanRole}. Status: ${subscription.status}`);
          }
        } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
          // Handle cancellation or payment failure: Downgrade user, revoke access, etc.
          // For simplicity, let's set role to a default 'user' (free tier)
          const { error } = await supabase
            .from('users')
            .update({
              role: 'user', // Or whatever your default/free tier role is
              stripe_subscription_id: null, // Clear subscription ID
              // current_plan_price_id: null,
            })
            .eq(appUserId ? 'id' : 'stripe_customer_id', appUserId || stripeCustomerId);

          if (error) {
            console.error(`Webhook: Error updating user for customer.subscription.updated (inactive - ${subscription.status}):`, error);
          } else {
            console.log(`Webhook: User subscription status ${subscription.status}. Role set to 'user'.`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // This event occurs when a subscription is definitively canceled (e.g., at period end)
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const appUserId = subscription.metadata?.app_user_id;

        const { error } = await supabase
          .from('users')
          .update({
            role: 'user', // Downgrade to free/default tier
            stripe_subscription_id: null,
            // current_plan_price_id: null,
          })
          .eq(appUserId ? 'id' : 'stripe_customer_id', appUserId || stripeCustomerId);

        if (error) {
          console.error(`Webhook: Error updating user for customer.subscription.deleted:`, error);
        } else {
          console.log(`Webhook: User subscription deleted. Role set to 'user'.`);
        }
        break;
      }
      // ... handle other event types as needed (e.g., invoice.payment_failed)
      default:
        console.log(`Webhook: Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error(`Webhook handler error for event ${event.type}: ${error.message}`, error);
    res.status(500).json({ error: `Webhook handler error: ${error.message}` });
  }
}

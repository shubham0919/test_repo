ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS current_plan_price_id TEXT;

COMMENT ON COLUMN users.role IS 'Stores the current active plan/role of the user (e.g., free, pro, team). Managed by Stripe webhooks.';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stores the Stripe Customer ID.';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stores the Stripe Subscription ID for the active subscription.';
COMMENT ON COLUMN users.current_plan_price_id IS 'Stores the Stripe Price ID for the active subscription.';

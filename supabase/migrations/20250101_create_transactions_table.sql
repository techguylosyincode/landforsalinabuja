-- Create transactions table for payment audit trail
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference text UNIQUE NOT NULL,

  -- Transaction details
  transaction_type text NOT NULL CHECK (transaction_type IN ('subscription', 'boost')),
  amount numeric NOT NULL,
  currency text DEFAULT 'NGN',

  -- Subscription fields
  subscription_tier text CHECK (subscription_tier IN ('pro', 'agency', 'premium')),
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'annual')),

  -- Boost fields
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  boost_duration integer CHECK (boost_duration IN (7, 14, 30)),

  -- Payment status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  gateway text DEFAULT 'paystack',
  gateway_response jsonb,

  -- Metadata
  ip_address text,
  user_agent text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  webhook_received_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON public.transactions(property_id);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.transactions;

-- Create RLS policies
-- Users can view their own transactions
CREATE POLICY "Users view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all transactions (for backend operations)
CREATE POLICY "Service role can manage transactions"
  ON public.transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

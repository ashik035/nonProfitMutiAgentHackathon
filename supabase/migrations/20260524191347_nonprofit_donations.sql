-- Nonprofit Donations tables
-- Campaigns (fundraising goals) and individual donation records.

CREATE TABLE IF NOT EXISTS public.nonprofit_campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name             text NOT NULL,
  description      text,
  goal             numeric NOT NULL DEFAULT 0,
  raised           numeric NOT NULL DEFAULT 0,
  donor_count      integer NOT NULL DEFAULT 0,
  start_date       date,
  end_date         date,
  is_active        boolean DEFAULT true,
  fund_designation text NOT NULL CHECK (fund_designation IN (
    'General Operating',
    'Youth Programs',
    'Health Initiative',
    'Technology Fund',
    'Emergency Relief'
  )) DEFAULT 'General Operating',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_donations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      uuid REFERENCES public.nonprofit_campaigns(id) ON DELETE SET NULL,
  donor_name       text NOT NULL,
  donor_email      text,
  amount           numeric NOT NULL CHECK (amount > 0),
  frequency        text NOT NULL CHECK (frequency IN ('One-Time','Monthly','Quarterly','Annual')),
  fund_designation text,
  is_anonymous     boolean DEFAULT false,
  payment_method   text CHECK (payment_method IN ('Credit Card','ACH','Check','PayPal')),
  notes            text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nonprofit_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage campaigns" ON public.nonprofit_campaigns;
CREATE POLICY "Authenticated users manage campaigns"
  ON public.nonprofit_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage donations" ON public.nonprofit_donations;
CREATE POLICY "Authenticated users manage donations"
  ON public.nonprofit_donations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_nonprofit_campaigns_updated_at ON public.nonprofit_campaigns;
CREATE TRIGGER update_nonprofit_campaigns_updated_at
  BEFORE UPDATE ON public.nonprofit_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_nonprofit_donations_updated_at ON public.nonprofit_donations;
CREATE TRIGGER update_nonprofit_donations_updated_at
  BEFORE UPDATE ON public.nonprofit_donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

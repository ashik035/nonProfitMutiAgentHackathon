-- Nonprofit Members table
-- Tracks member directory, tiers, statuses, and renewal dates.

CREATE TABLE IF NOT EXISTS public.nonprofit_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name         text NOT NULL,
  email        text NOT NULL,
  phone        text,
  tier         text NOT NULL CHECK (tier IN ('General','Professional','Board','Honorary')) DEFAULT 'General',
  status       text NOT NULL CHECK (status IN ('Active','Expiring','Lapsed','Pending')) DEFAULT 'Active',
  join_date    date,
  renewal_date date,
  employer     text,
  interests    text[] DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nonprofit_members ENABLE ROW LEVEL SECURITY;

-- All authenticated staff can read and write member records
DROP POLICY IF EXISTS "Authenticated users manage members" ON public.nonprofit_members;
CREATE POLICY "Authenticated users manage members"
  ON public.nonprofit_members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_nonprofit_members_updated_at ON public.nonprofit_members;
CREATE TRIGGER update_nonprofit_members_updated_at
  BEFORE UPDATE ON public.nonprofit_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

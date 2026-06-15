-- Nonprofit Programs table
-- Program impact tracker: outcomes, budgets, and beneficiary metrics.

CREATE TABLE IF NOT EXISTS public.nonprofit_programs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name                text NOT NULL,
  description         text,
  start_date          date,
  status              text NOT NULL CHECK (status IN ('active','completed','planning')) DEFAULT 'active',
  lead_staff          text,
  beneficiary_count   integer NOT NULL DEFAULT 0,
  volunteer_hours     integer NOT NULL DEFAULT 0,
  budget_used         integer NOT NULL DEFAULT 0,
  budget_total        integer NOT NULL DEFAULT 0,
  outcomes_achieved   integer NOT NULL DEFAULT 0,
  outcomes_target     integer NOT NULL DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE public.nonprofit_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage programs" ON public.nonprofit_programs;
CREATE POLICY "Authenticated users manage programs"
  ON public.nonprofit_programs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP TRIGGER IF EXISTS update_nonprofit_programs_updated_at ON public.nonprofit_programs;
CREATE TRIGGER update_nonprofit_programs_updated_at
  BEFORE UPDATE ON public.nonprofit_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

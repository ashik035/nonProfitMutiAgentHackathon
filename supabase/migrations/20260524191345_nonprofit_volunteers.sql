-- Nonprofit Volunteers tables
-- Tracks volunteer roster and individual shifts.

CREATE TABLE IF NOT EXISTS public.nonprofit_volunteers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name               text NOT NULL,
  email              text NOT NULL,
  phone              text,
  skills             text[] DEFAULT '{}',
  availability       text[] DEFAULT '{}',
  total_hours        numeric NOT NULL DEFAULT 0,
  joined_date        date,
  is_also_donor      boolean DEFAULT false,
  donor_total_giving numeric,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonprofit_volunteer_shifts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.nonprofit_volunteers(id) ON DELETE CASCADE,
  event_name   text NOT NULL,
  date         date NOT NULL,
  hours        numeric NOT NULL DEFAULT 0,
  status       text NOT NULL CHECK (status IN ('Upcoming','Completed','Cancelled')) DEFAULT 'Upcoming',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nonprofit_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonprofit_volunteer_shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage volunteers" ON public.nonprofit_volunteers;
CREATE POLICY "Authenticated users manage volunteers"
  ON public.nonprofit_volunteers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage volunteer shifts" ON public.nonprofit_volunteer_shifts;
CREATE POLICY "Authenticated users manage volunteer shifts"
  ON public.nonprofit_volunteer_shifts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_nonprofit_volunteers_updated_at ON public.nonprofit_volunteers;
CREATE TRIGGER update_nonprofit_volunteers_updated_at
  BEFORE UPDATE ON public.nonprofit_volunteers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_nonprofit_volunteer_shifts_updated_at ON public.nonprofit_volunteer_shifts;
CREATE TRIGGER update_nonprofit_volunteer_shifts_updated_at
  BEFORE UPDATE ON public.nonprofit_volunteer_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

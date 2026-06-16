CREATE TABLE IF NOT EXISTS public.user_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  agency_role TEXT NOT NULL DEFAULT 'user',
  org_id UUID,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_invites_email_idx ON public.user_invites (email);
CREATE INDEX IF NOT EXISTS user_invites_token_idx ON public.user_invites (token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_invites TO authenticated;
GRANT ALL ON public.user_invites TO service_role;

ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all invites"
  ON public.user_invites
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Invitees can view their own invite"
  ON public.user_invites
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE TRIGGER update_user_invites_updated_at
  BEFORE UPDATE ON public.user_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
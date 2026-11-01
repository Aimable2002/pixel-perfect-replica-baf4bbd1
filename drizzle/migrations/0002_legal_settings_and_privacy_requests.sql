CREATE TABLE public.legal_settings (
 id text PRIMARY KEY DEFAULT 'site' CHECK (id = 'site'),
 details jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.legal_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.legal_settings TO authenticated;
GRANT ALL ON public.legal_settings TO service_role;
ALTER TABLE public.legal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY legal_public_read ON public.legal_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY legal_admin_insert ON public.legal_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY legal_admin_update ON public.legal_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.privacy_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id uuid NOT NULL,
 kind text NOT NULL CHECK (kind IN ('delete_account', 'delete_meta_data', 'access_data', 'correct_data')),
 status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'in_review', 'action_required')),
 note text NOT NULL DEFAULT '' CHECK (length(note) <= 2000),
 response text NOT NULL DEFAULT '' CHECK (length(response) <= 4000),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.privacy_requests TO authenticated;
GRANT ALL ON public.privacy_requests TO service_role;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY privacy_owner_read ON public.privacy_requests FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY privacy_owner_insert ON public.privacy_requests FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND status = 'requested' AND response = '');
CREATE POLICY privacy_admin_update ON public.privacy_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE UNIQUE INDEX privacy_one_open_kind ON public.privacy_requests(owner_id, kind);
COMMENT ON TABLE public.privacy_requests IS 'Manual privacy review queue. Status does not represent completed deletion; no automated provider erasure is active.';
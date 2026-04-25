
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP POLICY IF EXISTS "Anyone can submit citizen reports" ON public.citizen_reports;
CREATE POLICY "Submit citizen report as self or anon"
  ON public.citizen_reports FOR INSERT TO anon, authenticated
  WITH CHECK (reporter_id IS NULL OR reporter_id = auth.uid());


-- Roles enum and table (separate from profiles for security)
CREATE TYPE public.app_role AS ENUM ('senior', 'junior', 'public');

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  zone TEXT,
  avatar_initials TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security definer function to check role without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Convenience: get the (first) role for a user
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Severity & status enums
CREATE TYPE public.severity AS ENUM ('warning', 'significant', 'critical');
CREATE TYPE public.incident_status AS ENUM ('reported', 'verified', 'dispatched', 'repairing', 'restored');

-- Incidents table
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  feeder TEXT NOT NULL,
  area TEXT NOT NULL,
  voltage TEXT NOT NULL,
  severity public.severity NOT NULL DEFAULT 'warning',
  status public.incident_status NOT NULL DEFAULT 'reported',
  affected_consumers INT NOT NULL DEFAULT 0,
  citizen_reports INT NOT NULL DEFAULT 0,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  restored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Citizen reports (raw public submissions before merging)
CREATE TABLE public.citizen_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  area TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

-- profiles: anyone authenticated can read (for showing engineer names); user updates own
CREATE POLICY "Profiles readable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles: user can read own role; only service role inserts (or trigger)
CREATE POLICY "Users read own role"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Seniors read all roles"
  ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'senior'));

-- incidents: public read (transparency portal), juniors update assigned, seniors full
CREATE POLICY "Incidents are public-readable"
  ON public.incidents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Seniors insert incidents"
  ON public.incidents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'senior'));
CREATE POLICY "Seniors update incidents"
  ON public.incidents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'senior'));
CREATE POLICY "Juniors update assigned incidents"
  ON public.incidents FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() AND public.has_role(auth.uid(), 'junior'));
CREATE POLICY "Seniors delete incidents"
  ON public.incidents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'senior'));

-- citizen_reports: anyone can submit; public read (heatmap); reporter sees own
CREATE POLICY "Citizen reports public-readable"
  ON public.citizen_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit citizen reports"
  ON public.citizen_reports FOR INSERT TO anon, authenticated WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER incidents_touch BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile + default 'public' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_full_name TEXT;
  v_initials TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );
  v_initials := UPPER(LEFT(REGEXP_REPLACE(v_full_name, '[^A-Za-z]', '', 'g'), 2));
  v_role := COALESCE((NEW.raw_user_meta_data ->> 'requested_role')::public.app_role, 'public');

  INSERT INTO public.profiles (id, full_name, avatar_initials, zone)
  VALUES (NEW.id, v_full_name, v_initials, NEW.raw_user_meta_data ->> 'zone');

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime on incidents + citizen_reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_reports;
ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER TABLE public.citizen_reports REPLICA IDENTITY FULL;

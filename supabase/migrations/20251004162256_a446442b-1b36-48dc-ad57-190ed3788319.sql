-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'landowner', 'user');

-- Create enum for land registration status
CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (security definer pattern)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create lands table
CREATE TABLE public.lands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title_deed_number TEXT UNIQUE NOT NULL,
  land_size DECIMAL NOT NULL,
  land_use TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  district TEXT NOT NULL,
  boundaries TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;

-- Create land_registrations table
CREATE TABLE public.land_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title_deed_number TEXT NOT NULL,
  land_size DECIMAL NOT NULL,
  land_use TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  district TEXT NOT NULL,
  boundaries TEXT,
  status registration_status DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.land_registrations ENABLE ROW LEVEL SECURITY;

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lands_updated_at
  BEFORE UPDATE ON public.lands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lands
CREATE POLICY "Anyone can view approved lands"
  ON public.lands FOR SELECT
  USING (status = 'active');

CREATE POLICY "Land owners can view their lands"
  ON public.lands FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Land owners can update their lands"
  ON public.lands FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all lands"
  ON public.lands FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for land_registrations
CREATE POLICY "Applicants can view their registrations"
  ON public.land_registrations FOR SELECT
  USING (auth.uid() = applicant_id);

CREATE POLICY "Land owners can submit registrations"
  ON public.land_registrations FOR INSERT
  WITH CHECK (auth.uid() = applicant_id AND public.has_role(auth.uid(), 'landowner'));

CREATE POLICY "Admins can view all registrations"
  ON public.land_registrations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update registrations"
  ON public.land_registrations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
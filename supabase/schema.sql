-- ============================================
-- Mapiker-AI Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Profiles Table (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. Projects Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Stage 1 & 2 Data (Requirements & Products)
  use_case TEXT,
  use_case_description TEXT,
  required_features TEXT[] DEFAULT '{}',
  application TEXT[] DEFAULT '{}',
  region TEXT DEFAULT 'Global',
  selected_products JSONB DEFAULT '{}',
  match_result JSONB,
  is_multi_environment BOOLEAN DEFAULT FALSE,

  -- Stage 3 Data (Pricing)
  pricing_calculated BOOLEAN DEFAULT FALSE,
  pricing_data JSONB,
  monthly_requests INTEGER DEFAULT 10000,

  -- Stage 4 Data (Quality Report)
  quality_report_requested BOOLEAN DEFAULT FALSE,
  quality_report_countries TEXT[] DEFAULT '{}',
  quality_report_features TEXT[] DEFAULT '{}',
  quality_report_price DECIMAL(10,2),
  quality_report_request_date TIMESTAMP WITH TIME ZONE,

  -- Test Keys Data
  test_keys_requested BOOLEAN DEFAULT FALSE,
  test_keys_vendors TEXT[] DEFAULT '{}',
  test_keys_period_days INTEGER,
  test_keys_request_date TIMESTAMP WITH TIME ZONE,

  -- Status
  current_stage INTEGER DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 4),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'quote_requested')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Quality Report Requests Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.quality_report_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  countries TEXT[] NOT NULL,
  features TEXT[] NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,

  -- Contact Information
  company_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  additional_notes TEXT,

  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'in_progress', 'completed', 'cancelled')),
  sales_notes TEXT,
  assigned_to TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Test Keys Requests Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_keys_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  vendors TEXT[] NOT NULL,
  test_period_days INTEGER NOT NULL CHECK (test_period_days IN (7, 14, 30)),

  -- Contact Information
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  expected_monthly_requests INTEGER,
  use_case_details TEXT,

  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'keys_sent', 'active', 'expired', 'cancelled')),
  sales_notes TEXT,
  assigned_to TEXT,
  keys_sent_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. Updated At Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.quality_report_requests;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.quality_report_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.test_keys_requests;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.test_keys_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 6. Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_report_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_keys_requests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects Policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Quality Report Requests Policies
DROP POLICY IF EXISTS "Users can view own quality report requests" ON public.quality_report_requests;
CREATE POLICY "Users can view own quality report requests" ON public.quality_report_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quality report requests" ON public.quality_report_requests;
CREATE POLICY "Users can insert own quality report requests" ON public.quality_report_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Test Keys Requests Policies
DROP POLICY IF EXISTS "Users can view own test keys requests" ON public.test_keys_requests;
CREATE POLICY "Users can view own test keys requests" ON public.test_keys_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own test keys requests" ON public.test_keys_requests;
CREATE POLICY "Users can insert own test keys requests" ON public.test_keys_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quality_report_requests_project_id ON public.quality_report_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_quality_report_requests_status ON public.quality_report_requests(status);
CREATE INDEX IF NOT EXISTS idx_test_keys_requests_project_id ON public.test_keys_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_test_keys_requests_status ON public.test_keys_requests(status);

-- ============================================
-- Done! Your database is ready.
-- ============================================

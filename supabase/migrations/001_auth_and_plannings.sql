-- Migration: Auth and Plannings
-- Description: Creates profiles table (extends auth.users) and plannings table for history
-- Date: 2026-01-06

-- ============================================
-- TABLE: profiles
-- Extension of auth.users with additional user data
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLE: plannings
-- Stores user's planning configurations and history
-- ============================================
CREATE TABLE IF NOT EXISTS plannings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Planning sans titre',

  -- Planning data stored as JSONB for flexibility
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  users_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  tasks_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  milestones_data JSONB DEFAULT '[]'::jsonb,
  planning_result JSONB,

  -- Status flags
  is_archived BOOLEAN DEFAULT FALSE,

  -- Sharing feature
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on plannings
ALTER TABLE plannings ENABLE ROW LEVEL SECURITY;

-- Policies for plannings (user's own plannings)
CREATE POLICY "Users can view own plannings" ON plannings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plannings" ON plannings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plannings" ON plannings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plannings" ON plannings
  FOR DELETE USING (auth.uid() = user_id);

-- Policy for shared plannings (public read access)
CREATE POLICY "Anyone can view shared plannings" ON plannings
  FOR SELECT USING (is_public = TRUE AND share_token IS NOT NULL);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_plannings_user_id ON plannings(user_id);
CREATE INDEX idx_plannings_share_token ON plannings(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_plannings_created_at ON plannings(created_at DESC);

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plannings_updated_at
  BEFORE UPDATE ON plannings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Generate share token
-- ============================================
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

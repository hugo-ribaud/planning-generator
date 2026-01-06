-- ============================================
-- PLANNING FAMILIAL - DATABASE SCHEMA
-- ============================================

-- 1. ENUMS
-- ============================================

CREATE TYPE task_type AS ENUM ('solo', 'common', 'flexible');
CREATE TYPE recurrence_type AS ENUM ('daily', 'weekly', 'once', 'custom');
CREATE TYPE period_type AS ENUM ('week', 'month');
CREATE TYPE time_preference AS ENUM ('morning', 'afternoon', 'evening', 'any');
CREATE TYPE milestone_status AS ENUM ('todo', 'in_progress', 'done');

-- 2. TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  days_off TEXT[] DEFAULT '{}',
  constraints TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planning Config
CREATE TABLE planning_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  period period_type DEFAULT 'week',
  start_date DATE NOT NULL,
  work_start TIME DEFAULT '09:00',
  work_end TIME DEFAULT '17:00',
  lunch_start TIME DEFAULT '12:30',
  lunch_end TIME DEFAULT '14:00',
  slot_duration INT DEFAULT 30,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES planning_config(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  type task_type DEFAULT 'solo',
  recurrence recurrence_type DEFAULT 'weekly',
  duration INT DEFAULT 60,
  priority INT DEFAULT 2,
  color TEXT,
  preferred_days TEXT[] DEFAULT '{}',
  preferred_time time_preference DEFAULT 'any',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES planning_config(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  status milestone_status DEFAULT 'todo',
  target_date DATE,
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_focus BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planning Slots
CREATE TABLE planning_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES planning_config(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  day DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  column_type TEXT DEFAULT 'common',
  is_manual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_slots ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Planning config policies (all authenticated users can CRUD)
CREATE POLICY "Authenticated users full access to configs"
  ON planning_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tasks policies
CREATE POLICY "Authenticated users full access to tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Milestones policies
CREATE POLICY "Authenticated users full access to milestones"
  ON milestones FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Planning slots policies
CREATE POLICY "Authenticated users full access to slots"
  ON planning_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. TRIGGERS (auto-update updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER planning_config_updated_at
  BEFORE UPDATE ON planning_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER planning_slots_updated_at
  BEFORE UPDATE ON planning_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    CASE
      WHEN (SELECT COUNT(*) FROM profiles) = 0 THEN '#3B82F6'  -- Hugo (blue)
      ELSE '#EC4899'  -- Delphine (pink)
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. REALTIME (pour la sync multi-appareils)
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE planning_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE planning_config;

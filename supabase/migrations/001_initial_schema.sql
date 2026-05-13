-- ============================================
-- BabyCare - Database Schema
-- Migration: 001_initial_schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BABIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS babies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_weight DECIMAL(5,2), -- in grams
  birth_height DECIMAL(5,2), -- in cm
  blood_type TEXT,
  avatar_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SLEEP RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS sleep_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sleep_start TIMESTAMPTZ NOT NULL,
  sleep_end TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN sleep_end IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (sleep_end - sleep_start))::INTEGER / 60
      ELSE NULL
    END
  ) STORED,
  quality TEXT CHECK (quality IN ('great', 'good', 'poor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEEDING RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS feeding_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  fed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  milk_type TEXT CHECK (milk_type IN ('breast', 'formula', 'other')) NOT NULL,
  amount_ml INTEGER,
  duration_minutes INTEGER, -- for breastfeeding
  breast_side TEXT CHECK (breast_side IN ('left', 'right', 'both')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DIAPER RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS diaper_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diaper_type TEXT CHECK (diaper_type IN ('urine', 'poop', 'both')) NOT NULL,
  has_diarrhea BOOLEAN DEFAULT FALSE,
  color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BABY HEALTH RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS baby_health_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  has_fever BOOLEAN DEFAULT FALSE,
  temperature DECIMAL(4,1),
  has_colic BOOLEAN DEFAULT FALSE,
  weight DECIMAL(6,2),
  height DECIMAL(5,2),
  medications JSONB DEFAULT '[]'::jsonb,
  symptoms TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MOTHER HEALTH RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS mother_health_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Vitals
  systolic_pressure INTEGER,
  diastolic_pressure INTEGER,
  heart_rate INTEGER,
  temperature DECIMAL(4,1),
  -- Symptoms
  has_headache BOOLEAN DEFAULT FALSE,
  headache_intensity INTEGER CHECK (headache_intensity BETWEEN 1 AND 10),
  has_nausea BOOLEAN DEFAULT FALSE,
  has_fever BOOLEAN DEFAULT FALSE,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  pain_location TEXT,
  -- Mental health
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 5),
  -- Sleep
  sleep_hours DECIMAL(4,1),
  sleep_quality TEXT CHECK (sleep_quality IN ('great', 'good', 'poor')),
  -- Notes
  medications JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GROWTH RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS growth_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(6,2), -- in kg
  height DECIMAL(5,2), -- in cm
  head_circumference DECIMAL(5,2), -- in cm
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VACCINATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vaccine_name TEXT NOT NULL,
  administered_at DATE,
  next_dose_date DATE,
  batch_number TEXT,
  provider TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  appointment_type TEXT CHECK (appointment_type IN ('baby', 'mother', 'both')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  doctor_name TEXT,
  location TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_babies_user_id ON babies(user_id);
CREATE INDEX idx_sleep_records_baby_id ON sleep_records(baby_id);
CREATE INDEX idx_sleep_records_start ON sleep_records(sleep_start DESC);
CREATE INDEX idx_feeding_records_baby_id ON feeding_records(baby_id);
CREATE INDEX idx_feeding_records_fed_at ON feeding_records(fed_at DESC);
CREATE INDEX idx_diaper_records_baby_id ON diaper_records(baby_id);
CREATE INDEX idx_diaper_records_changed_at ON diaper_records(changed_at DESC);
CREATE INDEX idx_baby_health_baby_id ON baby_health_records(baby_id);
CREATE INDEX idx_mother_health_user_id ON mother_health_records(user_id);
CREATE INDEX idx_mother_health_recorded_at ON mother_health_records(recorded_at DESC);
CREATE INDEX idx_growth_baby_id ON growth_records(baby_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaper_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mother_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Babies RLS
CREATE POLICY "Users can view own babies" ON babies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own babies" ON babies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own babies" ON babies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own babies" ON babies
  FOR DELETE USING (auth.uid() = user_id);

-- Sleep records RLS
CREATE POLICY "Users can manage own sleep records" ON sleep_records
  FOR ALL USING (auth.uid() = user_id);

-- Feeding records RLS
CREATE POLICY "Users can manage own feeding records" ON feeding_records
  FOR ALL USING (auth.uid() = user_id);

-- Diaper records RLS
CREATE POLICY "Users can manage own diaper records" ON diaper_records
  FOR ALL USING (auth.uid() = user_id);

-- Baby health RLS
CREATE POLICY "Users can manage own baby health records" ON baby_health_records
  FOR ALL USING (auth.uid() = user_id);

-- Mother health RLS
CREATE POLICY "Users can manage own mother health records" ON mother_health_records
  FOR ALL USING (auth.uid() = user_id);

-- Growth records RLS
CREATE POLICY "Users can manage own growth records" ON growth_records
  FOR ALL USING (auth.uid() = user_id);

-- Vaccinations RLS
CREATE POLICY "Users can manage own vaccination records" ON vaccinations
  FOR ALL USING (auth.uid() = user_id);

-- Appointments RLS
CREATE POLICY "Users can manage own appointments" ON appointments
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_babies_updated_at
  BEFORE UPDATE ON babies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

-- Daily baby summary view
CREATE OR REPLACE VIEW daily_baby_summary AS
SELECT 
  b.id as baby_id,
  b.user_id,
  b.name as baby_name,
  DATE(NOW() AT TIME ZONE 'America/Sao_Paulo') as summary_date,
  -- Feedings
  COUNT(DISTINCT f.id) as total_feedings,
  COALESCE(SUM(f.amount_ml), 0) as total_ml,
  -- Diapers
  COUNT(DISTINCT d.id) as total_diapers,
  COUNT(DISTINCT CASE WHEN d.diaper_type IN ('poop', 'both') THEN d.id END) as poop_count,
  -- Sleep
  COALESCE(SUM(s.duration_minutes), 0) as total_sleep_minutes,
  COUNT(DISTINCT s.id) as sleep_sessions
FROM babies b
LEFT JOIN feeding_records f ON f.baby_id = b.id 
  AND DATE(f.fed_at AT TIME ZONE 'America/Sao_Paulo') = DATE(NOW() AT TIME ZONE 'America/Sao_Paulo')
LEFT JOIN diaper_records d ON d.baby_id = b.id 
  AND DATE(d.changed_at AT TIME ZONE 'America/Sao_Paulo') = DATE(NOW() AT TIME ZONE 'America/Sao_Paulo')
LEFT JOIN sleep_records s ON s.baby_id = b.id 
  AND DATE(s.sleep_start AT TIME ZONE 'America/Sao_Paulo') = DATE(NOW() AT TIME ZONE 'America/Sao_Paulo')
WHERE b.is_active = TRUE
GROUP BY b.id, b.user_id, b.name;

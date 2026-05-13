export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Baby {
  id: string
  user_id: string
  name: string
  birth_date: string
  gender: 'male' | 'female' | 'other' | null
  birth_weight: number | null
  birth_height: number | null
  blood_type: string | null
  avatar_url: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SleepRecord {
  id: string
  baby_id: string
  user_id: string
  sleep_start: string
  sleep_end: string | null
  duration_minutes: number | null
  quality: 'great' | 'good' | 'poor' | null
  notes: string | null
  created_at: string
}

export interface FeedingRecord {
  id: string
  baby_id: string
  user_id: string
  fed_at: string
  milk_type: 'breast' | 'formula' | 'other'
  amount_ml: number | null
  duration_minutes: number | null
  breast_side: 'left' | 'right' | 'both' | null
  notes: string | null
  created_at: string
}

export interface DiaperRecord {
  id: string
  baby_id: string
  user_id: string
  changed_at: string
  diaper_type: 'urine' | 'poop' | 'both'
  has_diarrhea: boolean
  color: string | null
  notes: string | null
  created_at: string
}

export interface BabyHealthRecord {
  id: string
  baby_id: string
  user_id: string
  recorded_at: string
  has_fever: boolean
  temperature: number | null
  has_colic: boolean
  weight: number | null
  height: number | null
  medications: Medication[]
  symptoms: string[]
  notes: string | null
  created_at: string
}

export interface MotherHealthRecord {
  id: string
  user_id: string
  recorded_at: string
  systolic_pressure: number | null
  diastolic_pressure: number | null
  heart_rate: number | null
  temperature: number | null
  has_headache: boolean
  headache_intensity: number | null
  has_nausea: boolean
  has_fever: boolean
  pain_level: number | null
  pain_location: string | null
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | null
  energy_level: number | null
  anxiety_level: number | null
  sleep_hours: number | null
  sleep_quality: 'great' | 'good' | 'poor' | null
  medications: Medication[]
  notes: string | null
  created_at: string
}

export interface GrowthRecord {
  id: string
  baby_id: string
  user_id: string
  measured_at: string
  weight: number | null
  height: number | null
  head_circumference: number | null
  notes: string | null
  created_at: string
}

export interface Vaccination {
  id: string
  baby_id: string
  user_id: string
  vaccine_name: string
  administered_at: string | null
  next_dose_date: string | null
  batch_number: string | null
  provider: string | null
  notes: string | null
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  baby_id: string | null
  title: string
  appointment_type: 'baby' | 'mother' | 'both'
  scheduled_at: string
  doctor_name: string | null
  location: string | null
  notes: string | null
  reminder_sent: boolean
  completed: boolean
  created_at: string
}

export interface Medication {
  name: string
  dose: string
  time: string
}

export interface DailySummary {
  baby_id: string
  user_id: string
  baby_name: string
  summary_date: string
  total_feedings: number
  total_ml: number
  total_diapers: number
  poop_count: number
  total_sleep_minutes: number
  sleep_sessions: number
}

export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
export type MilkType = 'breast' | 'formula' | 'other'
export type DiaperType = 'urine' | 'poop' | 'both'
export type SleepQuality = 'great' | 'good' | 'poor'

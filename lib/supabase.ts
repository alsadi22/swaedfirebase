import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Profile = {
  id: string
  email: string
  phone?: string
  first_name: string
  last_name: string
  emirates_id?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  nationality?: string
  profile_photo?: string
  preferred_language: 'en' | 'ar'
  role: 'volunteer' | 'student' | 'organization' | 'admin' | 'super_admin'
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  organization_id: string
  title: string
  title_ar?: string
  description: string
  description_ar?: string
  category: string
  cover_image_url?: string
  event_type: 'one_time' | 'recurring' | 'multi_session'
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  location_type: 'physical' | 'virtual' | 'hybrid'
  location_name?: string
  location_address?: string
  emirate?: string
  city?: string
  volunteer_capacity?: number
  current_volunteers: number
  student_only: boolean
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  is_featured: boolean
  is_published: boolean
  created_at: string
}

export type Organization = {
  id: string
  name: string
  name_ar?: string
  type: 'ngo' | 'charity' | 'government' | 'private' | 'community'
  emirate: string
  city: string
  contact_email: string
  contact_phone: string
  description?: string
  logo_url?: string
  verification_status: 'pending' | 'approved' | 'rejected' | 'suspended'
  is_active: boolean
  created_at: string
}

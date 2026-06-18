export interface Profile {
  id: string
  display_name: string | null
  preferred_language: string | null
  created_at: string
  updated_at: string
}

export interface Accommodation {
  id: string
  user_id: string
  name: string
  address: string
  location: unknown
  is_active: boolean
  created_at: string
}

export interface TripStop {
  order: number
  name: string
  type: 'attraction' | 'restaurant' | 'transport' | 'accommodation'
  address: string
  coordinates: { lat: number; lng: number }
  duration_minutes: number
  cost_estimate: { min: number; max: number }
  description: string
  tips: string[]
  transport_to_next: {
    mode: string
    duration_minutes: number
    distance_meters: number
    cost_estimate: number
  }
}

export interface TripPlanData {
  title: string
  city: string
  total_duration_minutes: number
  total_cost_estimate: { min: number; max: number; currency: string }
  stops: TripStop[]
}

export interface TripPlan {
  id: string
  user_id: string
  accommodation_id: string | null
  title: string
  city: string
  country: string | null
  duration_hours: number
  transport_mode: string | null
  status: 'draft' | 'generated' | 'active' | 'completed'
  plan_data: TripPlanData | null
  total_cost_min: number | null
  total_cost_max: number | null
  currency: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      accommodations: {
        Row: Accommodation
        Insert: Omit<Accommodation, 'id' | 'created_at'>
        Update: Partial<Omit<Accommodation, 'id' | 'user_id' | 'created_at'>>
      }
      trip_plans: {
        Row: TripPlan
        Insert: Omit<TripPlan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TripPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

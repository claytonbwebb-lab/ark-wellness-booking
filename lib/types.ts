export interface Profile {
  id: string
  email: string
  name: string
  phone: string
  role: 'client' | 'admin'
  created_at: string
}

export interface Location {
  id: string
  name: string
  address: string
}

export interface Availability {
  id: string
  location_id: string
  day_of_week: number // 0=Sun, 6=Sat
  start_hour: number
  end_hour: number
}

export interface Booking {
  id: string
  user_id: string
  location_id: string
  date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string
  status: 'confirmed' | 'cancelled'
  created_at: string
  profiles?: Profile
  locations?: Location
}

export interface TimeSlot {
  time: string // HH:MM
  available: boolean
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  avatar_url: string
  email_verified_at: string | null
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

export interface UserToken {
  id: number
  name: string
  abilities: string[]
  last_used_at: string | null
  expires_at: string | null
  created_at: string
  is_current: boolean
}

export interface UpdateProfilePayload {
  name: string
  email: string
  phone?: string | null
}

export interface UpdatePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

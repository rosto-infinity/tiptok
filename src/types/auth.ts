import type { User } from './user'

export interface LoginPayload {
  email: string
  password: string
  device_name?: string
}

export interface RegisterPayload {
  name?: string
  email: string
  phone?: string | null
  birth_date?: string | null
  birth_place?: string | null
  password: string
  password_confirmation: string
  device_name?: string
}

export interface AuthResponse {
  message: string
  two_factor?: boolean
  token: string | null
  user: User
}

export interface TwoFactorChallengePayload {
  code?: string
  recovery_code?: string
  device_name?: string
}

export interface TwoFactorSecretKeyResponse {
  secretKey: string
}

export interface TwoFactorQrCodeResponse {
  svg: string
}

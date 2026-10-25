import apiClient from './client'
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  TwoFactorChallengePayload,
  TwoFactorQrCodeResponse,
  TwoFactorSecretKeyResponse,
} from '@/types/auth'

export const authApi = {
  async getCsrfCookie(): Promise<void> {
    await apiClient.get('/sanctum/csrf-cookie')
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const defaultDeviceName = import.meta.env.VITE_DEVICE_NAME || 'TipTok Web App'
    const res = await apiClient.post<AuthResponse>('/login', {
      device_name: defaultDeviceName,
      ...payload,
    })
    return res.data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const defaultDeviceName = import.meta.env.VITE_DEVICE_NAME || 'TipTok Web App'
    const res = await apiClient.post<AuthResponse>('/register', {
      device_name: defaultDeviceName,
      ...payload,
    })
    return res.data
  },

  async logout(): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/logout')
    return res.data
  },

  async twoFactorChallenge(payload: TwoFactorChallengePayload): Promise<AuthResponse> {
    const defaultDeviceName = import.meta.env.VITE_DEVICE_NAME || 'TipTok Web App'
    const res = await apiClient.post<AuthResponse>('/two-factor-challenge', {
      device_name: defaultDeviceName,
      ...payload,
    })
    return res.data
  },

  async confirmPassword(password: string): Promise<void> {
    await apiClient.post('/user/confirm-password', { password })
  },

  async enableTwoFactor(): Promise<void> {
    await apiClient.post('/user/two-factor-authentication')
  },

  async disableTwoFactor(): Promise<void> {
    await apiClient.delete('/user/two-factor-authentication')
  },

  async getTwoFactorQrCode(): Promise<TwoFactorQrCodeResponse> {
    const res = await apiClient.get<TwoFactorQrCodeResponse>('/user/two-factor-qr-code')
    return res.data
  },

  async getTwoFactorSecretKey(): Promise<TwoFactorSecretKeyResponse> {
    const res = await apiClient.get<TwoFactorSecretKeyResponse>('/user/two-factor-secret-key')
    return res.data
  },

  async confirmTwoFactor(code: string): Promise<void> {
    await apiClient.post('/user/confirmed-two-factor-authentication', { code })
  },

  async getTwoFactorRecoveryCodes(): Promise<string[]> {
    const res = await apiClient.get<string[]>('/user/two-factor-recovery-codes')
    return res.data
  },

  async regenerateTwoFactorRecoveryCodes(): Promise<string[]> {
    const res = await apiClient.post<string[]>('/user/two-factor-recovery-codes')
    return res.data
  },

  async forgotPassword(email: string): Promise<{ status: string }> {
    const res = await apiClient.post<{ status: string }>('/forgot-password', { email })
    return res.data
  },
}

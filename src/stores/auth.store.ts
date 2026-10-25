import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth.api'
import { userApi } from '@/api/user.api'
import type { User } from '@/types/user'
import type { LoginPayload, RegisterPayload, TwoFactorChallengePayload } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('tiptok_token'))
  const user = ref<User | null>(
    localStorage.getItem('tiptok_user')
      ? JSON.parse(localStorage.getItem('tiptok_user') as string)
      : null,
  )
  const isLoading = ref<boolean>(false)
  const pendingTwoFactor = ref<boolean>(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setAuthData = (newToken: string | null, newUser: User) => {
    if (newToken) {
      token.value = newToken
      localStorage.setItem('tiptok_token', newToken)
    }
    user.value = newUser
    localStorage.setItem('tiptok_user', JSON.stringify(newUser))
    pendingTwoFactor.value = false
  }

  const clearAuthData = () => {
    token.value = null
    user.value = null
    pendingTwoFactor.value = false
    localStorage.removeItem('tiptok_token')
    localStorage.removeItem('tiptok_user')
  }

  const login = async (payload: LoginPayload) => {
    isLoading.value = true
    try {
      const response = await authApi.login(payload)
      if (response.two_factor) {
        pendingTwoFactor.value = true
        return { twoFactor: true }
      }

      setAuthData(response.token, response.user)
      return { twoFactor: false }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (payload: RegisterPayload) => {
    isLoading.value = true
    try {
      const response = await authApi.register(payload)
      setAuthData(response.token, response.user)
      return response
    } finally {
      isLoading.value = false
    }
  }

  const twoFactorChallenge = async (payload: TwoFactorChallengePayload) => {
    isLoading.value = true
    try {
      const response = await authApi.twoFactorChallenge(payload)
      setAuthData(response.token, response.user)
      return response
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      if (token.value) {
        await authApi.logout()
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      clearAuthData()
      isLoading.value = false
    }
  }

  const fetchUser = async () => {
    if (!token.value) return null
    try {
      const profile = await userApi.getProfile()
      user.value = profile
      localStorage.setItem('tiptok_user', JSON.stringify(profile))
      return profile
    } catch (err) {
      clearAuthData()
      throw err
    }
  }

  return {
    token,
    user,
    isLoading,
    pendingTwoFactor,
    isAuthenticated,
    login,
    register,
    twoFactorChallenge,
    logout,
    fetchUser,
    setAuthData,
    clearAuthData,
  }
})

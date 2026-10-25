import apiClient from './client'
import type { User, UpdateProfilePayload, UpdatePasswordPayload } from '@/types/user'

export const userApi = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<{ data: User }>('/api/v1/user')
    return res.data.data
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<void> {
    await apiClient.put('/user/profile-information', payload)
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    await apiClient.put('/user/password', payload)
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('avatar', file)

    const res = await apiClient.post<{ data: User }>('/api/v1/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data
  },

  async deleteAvatar(): Promise<User> {
    const res = await apiClient.delete<{ data: User }>('/api/v1/user/avatar')
    return res.data.data
  },
}

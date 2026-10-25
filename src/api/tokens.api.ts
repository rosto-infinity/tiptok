import apiClient from './client'
import type { UserToken } from '@/types/user'

export const tokensApi = {
  async listTokens(): Promise<UserToken[]> {
    const res = await apiClient.get<{ data: UserToken[] }>('/api/v1/user/tokens')
    return res.data.data
  },

  async revokeToken(tokenId: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/api/v1/user/tokens/${tokenId}`)
    return res.data
  },

  async revokeOtherTokens(): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>('/api/v1/user/tokens/others')
    return res.data
  },
}

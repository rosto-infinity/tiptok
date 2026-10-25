import apiClient from './client'
import type { UserToken } from '@/types/user'

export const tokensApi = {
  async listTokens(): Promise<UserToken[]> {
    const res = await apiClient.get<{ data: UserToken[] }>('/api/user/tokens')
    return res.data.data
  },

  async revokeToken(tokenId: number): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/api/user/tokens/${tokenId}`)
    return res.data
  },

  async revokeOtherTokens(): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>('/api/user/tokens/others')
    return res.data
  },
}

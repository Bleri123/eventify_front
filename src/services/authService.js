import { apiClient } from '../utils/apiClient'

export const login = async (email, password) => {
  const { data } = await apiClient.post('/auth/login', { email, password })
  return data
}

export const register = async (userData) => {
  const { data } = await apiClient.post('/auth/register', userData)
  return data
}

export const getUserProfile = async () => {
  const { data } = await apiClient.get('/auth/user-profile')
  return data
}

export const logout = async () => {
  await apiClient.post('/auth/logout')
}
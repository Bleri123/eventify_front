import { apiClient } from '../utils/apiClient'

export const getGenres = async () => {
  const { data } = await apiClient.get('/genres')
  return data
}

export const getMovies = async (filters) => {
  const params = {}

  if (filters.search?.trim()) params.search = filters.search.trim()
  if (filters.genreId && filters.genreId !== 'all') params.genre_id = filters.genreId
  if (filters.date) params.date = filters.date
  if (filters.page) params.page = filters.page
  params.per_page = 8
  params.status = 'now_showing'

  const { data } = await apiClient.get('/movies', { params })
  return data
}
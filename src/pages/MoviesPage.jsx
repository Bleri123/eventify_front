import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ReactDatePicker from 'react-datepicker'
import { getMovies } from '../services/moviesService'
import MovieCard from '../components/MovieCard'
import Pagination from '../components/Pagination'
import Loader from '../components/Loader'
import "react-datepicker/dist/react-datepicker.css";
import './MoviesPage.css'

function MoviesPage() {
  const todayDate = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => todayDate.toISOString().slice(0, 10), [todayDate])
  const [searchParams, setSearchParams] = useSearchParams()

  // Local state for search input (updates immediately)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const [movies, setMovies] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get filters from URL params
  const filters = useMemo(() => {
    const urlDate = searchParams.get('date')
    const effectiveDateStr =
      urlDate && urlDate >= todayStr ? urlDate : todayStr

    return {
      search: searchParams.get('search') || '',
      genreId: searchParams.get('genre_id') || 'all',
      date: effectiveDateStr,
      page: parseInt(searchParams.get('page') || '1', 10),
    }
  }, [searchParams, todayStr])

  // Debounce search: update URL params after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (searchInput.trim()) {
        params.set('search', searchInput.trim())
      } else {
        params.delete('search')
      }
      params.delete('page') // reset to page 1
      setSearchParams(params)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput]) // only depends on searchInput

  // Load movies whenever filters change
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getMovies(filters)
        if (cancelled) return

        setMovies(data.data || [])
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
        })
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Error loading movies')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [filters])

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
  }

  const handleDateChange = (date) => {
    if (!date) return
    const picked = new Date(date)
    if (picked < new Date(todayStr)) return

    const iso = picked.toISOString().slice(0, 10)
    const params = new URLSearchParams(searchParams)
    params.set('date', iso)
    params.delete('page')
    setSearchParams(params)
  }

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
  }

  const selectedDate = useMemo(
    () => new Date(filters.date),
    [filters.date]
  )

  return (
    <div className="movies-page">
      {/* Top filters bar */}
      <section className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search Movies"
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>

        <div className="date-select">
          <ReactDatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={todayDate}
            dateFormat="yyyy-MM-dd"
            className="date-picker-input"
          />
        </div>
      </section>

      {/* Movies grid */}
      <section className="movies-grid">
        {loading && <Loader />}
        {error && <div className="error">{error}</div>}
        {!loading && !error && movies.length === 0 && (
          <div className="info">No movies found for these filters.</div>
        )}

        {!loading && movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} selectedDate={filters.date} />
        ))}
      </section>

      {/* Pagination */}
      {!loading && pagination.last_page > 1 && (
        <Pagination
          current={pagination.current_page}
          last={pagination.last_page}
          onChange={goToPage}
        />
      )}
    </div>
  )
}

export default MoviesPage
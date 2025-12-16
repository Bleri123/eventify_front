import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import ReactDatePicker from 'react-datepicker'
import { getMovieById } from '../services/moviesService'
import { getImageUrl } from '../utils/imageUrl'
import Loader from '../components/Loader'
import 'react-datepicker/dist/react-datepicker.css'
import './MovieDetailsPage.css'

function MovieDetailsPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const todayDate = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => todayDate.toISOString().slice(0, 10), [todayDate])
  
  // Get date from URL, but validate it
  const urlDate = searchParams.get('date')
  const effectiveDate = useMemo(() => {
    if (!urlDate) return todayStr
    // If URL date is in the past, use today instead
    return urlDate >= todayStr ? urlDate : todayStr
  }, [urlDate, todayStr])

  // Update URL if date was invalid (in the past)
  useEffect(() => {
    if (urlDate && urlDate < todayStr) {
      const params = new URLSearchParams(searchParams)
      params.set('date', todayStr)
      setSearchParams(params, { replace: true }) // replace: true to avoid adding to history
    }
  }, [urlDate, todayStr, searchParams, setSearchParams])

  const dateObj = useMemo(() => new Date(effectiveDate), [effectiveDate])

  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getMovieById(id, effectiveDate) // Use effectiveDate, not selectedDate
        setMovie(data)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load movie details')
      } finally {
        setLoading(false)
      }
    }

    loadMovie()
  }, [id, effectiveDate]) // Use effectiveDate

  const handleDateChange = (date) => {
    if (!date) return
    const picked = new Date(date)
    if (picked < new Date(todayStr)) return

    const iso = picked.toISOString().slice(0, 10)
    const params = new URLSearchParams(searchParams)
    params.set('date', iso)
    setSearchParams(params)
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="movie-details-page">
        <Loader />
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="movie-details-page">
        <div className="error">{error || 'Movie not found'}</div>
      </div>
    )
  }

  return (
    <div className="movie-details-page">
      <div className="movie-details-container">
        {/* Left: Poster */}
        <div className="movie-poster">
          {movie.poster_url ? (
            <img src={getImageUrl(movie.poster_url)} alt={movie.title} />
          ) : (
            <div className="poster-placeholder">{movie.title}</div>
          )}
        </div>

        {/* Right: Details */}
        <div className="movie-info-section">
          <h1 className="movie-title">{movie.title}</h1>
          
          <div className="movie-meta">
            <div className="genres">
              {movie.genres && movie.genres.length > 0 ? (
                movie.genres.map((genre, idx) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                    {idx < movie.genres.length - 1 && ', '}
                  </span>
                ))
              ) : (
                <span className="genre-tag">No genres</span>
              )}
            </div>
            
            <div className="duration">
              {formatDuration(movie.duration_minutes)}
            </div>
          </div>

          {/* Date selector */}
          <div className="date-selector">
            <label>Select Date:</label>
            <ReactDatePicker
              selected={dateObj}
              onChange={handleDateChange}
              minDate={todayDate}
              dateFormat="yyyy-MM-dd"
              className="date-picker-input"
            />
          </div>

          {/* Showtimes */}
          <div className="showtimes-section">
            {movie.screenings && movie.screenings.length > 0 ? (
              <div className="showtimes-grid">
                {movie.screenings.map((screening) => {
                  const time = new Date(screening.start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const showroomName = screening.showroom?.name || 'Unknown'

                  return (
                    <button
                        key={screening.id}
                        className="showtime-button"
                        onClick={() => {
                            navigate(`/tickets/${screening.id}`)
                        }}
                        >
                        <span>{time}</span>
                        <span>{showroomName}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="no-showtimes">
                No showtimes available for this date.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetailsPage
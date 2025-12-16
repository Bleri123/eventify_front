import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScreeningById } from '../services/moviesService'
import { getImageUrl } from '../utils/imageUrl'
import Loader from '../components/Loader'
import minusIcon from '../assets/minus-circle.svg'
import plusIcon from '../assets/plus-circle.svg'
import './TicketSelectionPage.css'

function TicketSelectionPage() {
  const { screeningId } = useParams()
  const navigate = useNavigate()
  const [screening, setScreening] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ticketCount, setTicketCount] = useState(0)

  useEffect(() => {
    const loadScreening = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getScreeningById(screeningId)
        setScreening(data)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load screening details')
      } finally {
        setLoading(false)
      }
    }

    loadScreening()
  }, [screeningId])

  const handleDecrease = () => {
    if (ticketCount > 0) {
      setTicketCount(ticketCount - 1)
    }
  }

  const handleIncrease = () => {
    setTicketCount(ticketCount + 1)
  }

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString)
    const day = date.toLocaleDateString('en-US', { weekday: 'long' })
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    return { day: isToday ? 'Today' : day, time, date: date.toLocaleDateString() }
  }

  if (loading) {
    return (
      <div className="ticket-selection-page">
        <Loader />
      </div>
    )
  }

  if (error || !screening || !screening.movie) {
    return (
      <div className="ticket-selection-page">
        <div className="error">{error || 'Screening not found'}</div>
      </div>
    )
  }

  const { day, time } = formatDateTime(screening.start_time)
  const movie = screening.movie
  const showroom = screening.showroom

  return (
    <div className="ticket-selection-page">
      <div className="ticket-selection-container">
        {/* Left: Poster */}
        <div className="movie-poster">
          {movie.poster_url ? (
            <img src={getImageUrl(movie.poster_url)} alt={movie.title} />
          ) : (
            <div className="poster-placeholder">{movie.title}</div>
          )}
        </div>

        {/* Right: Ticket Selection Card */}
        <div className="ticket-card">
          <h1 className="ticket-movie-title">{movie.title}</h1>
          
          <div className="ticket-info">
            <div className="ticket-info-item">
              <span className="ticket-value">{showroom?.name || 'Unknown'}</span>
            </div>
            
            <div className="ticket-info-item">
              <span className="ticket-value">{day}, {time}</span>
            </div>
          </div>

          {/* White border separator */}
          <div className="ticket-divider"></div>

          {/* Tickets section - horizontal layout */}
          <div className="tickets-section">
            <label className="tickets-label">Tickets</label>
            
            <div className="ticket-counter">
              <button
                className="counter-button"
                onClick={handleDecrease}
                disabled={ticketCount === 0}
              >
                <img src={minusIcon} alt="Decrease" className="counter-icon" />
              </button>
              <span className="ticket-number">{ticketCount}</span>
              <button
                className="counter-button counter-button-plus"
                onClick={handleIncrease}
              >
                <img src={plusIcon} alt="Increase" className="counter-icon" />
              </button>
            </div>
          </div>

          {/* White border separator */}
          <div className="ticket-divider"></div>

          {/* Next Step button aligned to right */}
          <div className="next-step-container">
            <button
              className="next-step-button"
              disabled={ticketCount === 0}
              onClick={() => {
                navigate(`/seats/${screeningId}?tickets=${ticketCount}`)
              }}
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketSelectionPage
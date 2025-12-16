// src/pages/SeatSelectionPage.jsx
import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getSeatsForScreening } from '../services/moviesService'
import { getImageUrl } from '../utils/imageUrl'
import Loader from '../components/Loader'
import './SeatSelectionPage.css'

function SeatSelectionPage() {
    const { screeningId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const ticketCount = parseInt(searchParams.get('tickets') || '1', 10)

    const [seats, setSeats] = useState([])
    const [screening, setScreening] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedSeats, setSelectedSeats] = useState([])

    useEffect(() => {
        const loadSeats = async () => {
            setLoading(true)
            setError(null)

            try {
                const data = await getSeatsForScreening(screeningId)
                setSeats(data.seats)
                setScreening(data.screening)
            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to load seats')
            } finally {
                setLoading(false)
            }
        }

        loadSeats()
    }, [screeningId])

    // Group seats by row
    const seatsByRow = useMemo(() => {
        const grouped = {}
        seats.forEach((seat) => {
            if (!grouped[seat.row_label]) {
                grouped[seat.row_label] = []
            }
            grouped[seat.row_label].push(seat)
        })
        return grouped
    }, [seats])

    // Get max seat number for column headers
    const maxSeatNumber = useMemo(() => {
        return Math.max(...seats.map((s) => s.seat_number), 0)
    }, [seats])

    const handleSeatClick = (seat) => {
        if (seat.is_booked) return // Can't select booked seats

        const isSelected = selectedSeats.some((s) => s.id === seat.id)

        if (isSelected) {
            // Deselect
            setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id))
        } else {
            // Select (but limit to ticket count)
            if (selectedSeats.length < ticketCount) {
                setSelectedSeats([...selectedSeats, seat])
            }
        }
    }

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString)
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()
        const day = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' })
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return { day, time }
    }

    // Calculate total price
    const totalPrice = useMemo(() => {
        if (!screening) return 0
        return selectedSeats.length * parseFloat(screening.base_price)
    }, [selectedSeats, screening])

    // Format selected seats display
    const selectedSeatsDisplay = useMemo(() => {
        if (selectedSeats.length === 0) return 'No seats selected'

        // Group by row
        const byRow = {}
        selectedSeats.forEach((seat) => {
            if (!byRow[seat.row_label]) {
                byRow[seat.row_label] = []
            }
            byRow[seat.row_label].push(seat.seat_number)
        })

        const parts = []
        Object.keys(byRow).sort().forEach((row) => {
            const numbers = byRow[row].sort((a, b) => a - b)
            if (numbers.length === 1) {
                parts.push(`Row ${row} Seat ${numbers[0]}`)
            } else {
                // Check if consecutive
                const isConsecutive = numbers.every((n, i) => i === 0 || n === numbers[i - 1] + 1)
                if (isConsecutive) {
                    parts.push(`Row ${row} Seats ${numbers[0]}-${numbers[numbers.length - 1]}`)
                } else {
                    parts.push(`Row ${row} Seats ${numbers.join(', ')}`)
                }
            }
        })

        return parts.join(', ')
    }, [selectedSeats])

    if (loading) {
        return (
            <div className="seat-selection-page">
                <Loader />
            </div>
        )
    }

    if (error || !screening || !screening.movie) {
        return (
            <div className="seat-selection-page">
                <div className="error">{error || 'Screening not found'}</div>
            </div>
        )
    }

    const { day, time } = formatDateTime(screening.start_time)
    const movie = screening.movie
    const showroom = screening.showroom

    const rowLabels = Object.keys(seatsByRow).sort()

    return (
        <div className="seat-selection-page">
            <div className="seat-selection-container">
                {/* Left: Seat Map */}
                <div className="seat-map-section">
                    <div className="seat-map-card">
                        <div className="screen-label">Screen</div>

                        <div className="seat-grid-container">
                            {/* Column numbers */}
                            <div className="column-numbers">
                                <div></div> {/* Empty for row label space */}
                                <div
                                    className="column-numbers-inner"
                                    style={{ gridTemplateColumns: `repeat(${maxSeatNumber}, 1fr)` }}
                                >
                                    {Array.from({ length: maxSeatNumber }, (_, i) => i + 1).map((num) => (
                                        <div key={num} className="column-number">
                                            {num}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Seat grid */}
                            <div className="seat-grid">
                                {rowLabels.map((rowLabel) => {
                                    // Create array of all possible seat numbers (1 to maxSeatNumber)
                                    const allSeatNumbers = Array.from({ length: maxSeatNumber }, (_, i) => i + 1)
                                    // Create a map of seat_number -> seat object for quick lookup
                                    const seatMap = new Map(seatsByRow[rowLabel].map(seat => [seat.seat_number, seat]))

                                    return (
                                        <div key={rowLabel} className="seat-row">
                                            <div className="row-label">{rowLabel}</div>
                                            <div
                                                className="row-seats"
                                                style={{ gridTemplateColumns: `repeat(${maxSeatNumber}, 1fr)` }}
                                            >
                                                {allSeatNumbers.map((seatNum) => {
                                                    const seat = seatMap.get(seatNum)
                                                    if (!seat) {
                                                        // No seat at this position (shouldn't happen, but handle gracefully)
                                                        return <div key={seatNum} className="seat-empty"></div>
                                                    }

                                                    const isSelected = selectedSeats.some((s) => s.id === seat.id)
                                                    const seatClass = `seat ${seat.is_booked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${!seat.is_booked && !isSelected ? 'available' : ''}`

                                                    return (
                                                        <button
                                                            key={seat.id}
                                                            className={seatClass}
                                                            onClick={() => handleSeatClick(seat)}
                                                            disabled={seat.is_booked}
                                                            title={`Row ${seat.row_label}, Seat ${seat.seat_number}`}
                                                        >
                                                            {/* {seat.seat_number} */}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="seat-legend">
                            <div className="legend-item">
                                <div className="legend-seat booked"></div>
                                <span>Booked</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="order-summary-section">
                    <div className="order-summary-card">
                        {/* Movie Poster */}
                        <div className="summary-poster">
                            {movie.poster_url ? (
                                <img src={getImageUrl(movie.poster_url)} alt={movie.title} />
                            ) : (
                                <div className="poster-placeholder">{movie.title}</div>
                            )}
                        </div>

                        {/* Movie Info */}
                        <h2 className="summary-movie-title">{movie.title}</h2>
                        <div className="summary-info">
                            <div>{showroom?.name || 'Unknown'}</div>
                            <div>Playing {day} {time}</div>
                        </div>

                        {/* Selected Seats */}
                        <div className="summary-seats">
                            <div className="summary-label">Selected Seats:</div>
                            <div className="summary-value">{selectedSeatsDisplay}</div>
                        </div>

                        {/* Price */}
                        <div className="summary-price">
                            <div className="price-row">
                                <span>Normal price</span>
                                <span>{selectedSeats.length} X {parseFloat(screening.base_price).toFixed(2)} €</span>
                            </div>
                            <div className="price-row total">
                                <span>Total Price</span>
                                <span>{totalPrice.toFixed(2)} €</span>
                            </div>
                        </div>

                        {/* Next Step Button */}
                        <button
                            className="next-step-button"
                            disabled={selectedSeats.length !== ticketCount}
                            onClick={() => {
                                const seatIds = selectedSeats.map(seat => seat.id)
                                navigate(`/payment/${screeningId}?seats=${JSON.stringify(seatIds)}`)
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

export default SeatSelectionPage
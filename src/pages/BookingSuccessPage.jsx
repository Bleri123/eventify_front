import { useLocation, useNavigate } from 'react-router-dom'
import './BookingSuccessPage.css'

function BookingSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const bookingId = location.state?.bookingId

  return (
    <div className="booking-success-page">
      <div className="success-container">
        <h1>Booking Confirmed!</h1>
        <p>Your payment was successful. Booking ID: {bookingId}</p>
        <button onClick={() => navigate('/')}>Back to Movies</button>
      </div>
    </div>
  )
}

export default BookingSuccessPage
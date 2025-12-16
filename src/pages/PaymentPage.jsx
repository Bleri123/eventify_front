import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getScreeningById } from '../services/moviesService'
import { createPaymentIntent, confirmPayment } from '../services/paymentService'
import Loader from '../components/Loader'
import './PaymentPage.css'

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set in .env file')
}

const stripePromise = STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null

function PaymentForm() {
  const { screeningId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()

  // Memoize seatIds to prevent infinite loop
  const seatIds = useMemo(() => {
    try {
      const seatsParam = searchParams.get('seats')
      return seatsParam ? JSON.parse(seatsParam) : []
    } catch {
      return []
    }
  }, [searchParams])

  const [screening, setScreening] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)

  useEffect(() => {
    // Prevent running if seatIds is empty or already loaded
    if (!seatIds.length || clientSecret) return

    let isMounted = true

    const loadData = async () => {
      try {
        // Load screening details
        const screeningData = await getScreeningById(screeningId)
        if (!isMounted) return
        setScreening(screeningData)

        // Create payment intent
        const intentData = await createPaymentIntent(screeningId, seatIds)
        if (!isMounted) return
        setClientSecret(intentData.client_secret)
      } catch (err) {
        if (!isMounted) return
        const errorMessage = err?.response?.data?.error || err?.message || 'Failed to initialize payment'
        setError(errorMessage)
        
        // If 401, redirect to login
        if (err?.response?.status === 401) {
          navigate('/login', { state: { from: location.pathname } })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [screeningId, seatIds, clientSecret, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

    setProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (stripeError) {
        setError(stripeError.message)
        setProcessing(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm on backend and create booking
        await confirmPayment(paymentIntent.id, screeningId, seatIds)
        
        // Redirect to success page or booking confirmation
        navigate('/booking-success', { state: { bookingId: paymentIntent.id } })
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Payment failed'
      setError(errorMessage)
      
      // If 401, redirect to login
      if (err?.response?.status === 401) {
        navigate('/login', { state: { from: location.pathname } })
      }
      setProcessing(false)
    }
  }

  if (loading || !screening || !clientSecret) {
    return (
      <div className="payment-page">
        <Loader />
      </div>
    )
  }

  if (error && error.includes('401')) {
    return (
      <div className="payment-page">
        <div className="error-message">Please log in to continue with payment</div>
      </div>
    )
  }

  const totalPrice = screening.base_price * seatIds.length

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1 className="payment-title">PAYMENT</h1>

        <div className="payment-summary">
          <div className="summary-item">
            <span>Movie:</span>
            <span>{screening.movie?.title || 'Unknown'}</span>
          </div>
          <div className="summary-item">
            <span>Seats:</span>
            <span>{seatIds.length} seat(s)</span>
          </div>
          <div className="summary-item total">
            <span>Total:</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="card-element-wrapper">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#f5f5f5',
                    '::placeholder': {
                      color: '#999',
                    },
                  },
                  invalid: {
                    color: '#ff6b6b',
                  },
                },
              }}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="pay-button"
            disabled={!stripe || processing || !clientSecret}
          >
            {processing ? 'Processing...' : `Pay ${totalPrice.toFixed(2)} €`}
          </button>
        </form>
      </div>
    </div>
  )
}

function PaymentPage() {
    if (!stripePromise) {
      return (
        <div className="payment-page">
          <div className="error-message">
            Payment system not configured. Please contact support.
          </div>
        </div>
      )
    }
  
    return (
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    )
  }

export default PaymentPage
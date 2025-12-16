import { apiClient } from '../utils/apiClient'

export const createPaymentIntent = async (screeningId, seatIds) => {
  const { data } = await apiClient.post('/payments/create-intent', {
    screening_id: screeningId,
    seat_ids: seatIds,
  })
  return data
}

export const confirmPayment = async (paymentIntentId, screeningId, seatIds) => {
  const { data } = await apiClient.post('/payments/confirm', {
    payment_intent_id: paymentIntentId,
    screening_id: screeningId,
    seat_ids: seatIds,
  })
  return data
}
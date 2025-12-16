import { Navigate } from 'react-router-dom'
import { getAuthToken } from '../utils/apiClient'

function GuestRoute({ children }) {
  const token = getAuthToken()

  // If user is logged in, redirect to home
  if (token) {
    return <Navigate to="/" replace />
  }

  return children
}

export default GuestRoute
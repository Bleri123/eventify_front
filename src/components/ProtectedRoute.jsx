import { Navigate, useLocation } from 'react-router-dom'
import { getAuthToken } from '../utils/apiClient'

function ProtectedRoute({ children }) {
  const token = getAuthToken()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
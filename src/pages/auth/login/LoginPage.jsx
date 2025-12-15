import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getUserProfile } from '../../../services/authService'
import { setAuthToken } from '../../../utils/apiClient'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Login and get token
      const loginResponse = await login(email, password)
      setAuthToken(loginResponse.access_token)

      // Get user profile to check role
      const user = await getUserProfile()

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/dashboard')
      } else {
        // User stays on movies page (or redirect to home)
        navigate('/')
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">LOGIN TO EVENTIFY</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <a href="/forgot-password" className="forgot-password">
            Forgot Password?
          </a>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
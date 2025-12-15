import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import logo from '../../assets/eventify-logo.png'
import { getGenres } from '../../services/moviesService'
import { logout } from '../../services/authService'
import { getAuthToken, setAuthToken } from '../../utils/apiClient'
import './Header.css'

function Header() {
  const [genres, setGenres] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedGenreId = searchParams.get('genre_id')

  // Check authentication state
  const checkAuth = () => {
    const token = getAuthToken()
    setIsAuthenticated(!!token)
  }

  useEffect(() => {
    // Check auth on mount and location change
    checkAuth()

    // Listen for storage changes (when token is set/removed in other tabs/components)
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        checkAuth()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    const loadGenres = async () => {
      try {
        const data = await getGenres()
        setGenres(data)
      } catch {
        // handle error
      }
    }
    loadGenres()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [location.pathname]) // Re-check auth when route changes

  const handleGenreSelect = (genreId) => {
    const params = new URLSearchParams(searchParams)
    if (genreId) params.set('genre_id', genreId)
    else params.delete('genre_id')
    params.delete('page')
    navigate(`/?${params.toString()}`)
  }

  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      await logout()
    } catch (error) {
      // Silently handle errors - still logout locally
      console.log("error", error);
      
    } finally {
      setAuthToken(null)
      setIsAuthenticated(false)
      navigate('/')
    }
  }

  const selectedGenre = genres.find(g => String(g.id) === selectedGenreId)

  return (
    <header className="header">
      <NavLink to="/" className="logo">
        <img src={logo} alt="Eventify Cinema" className="logo-image" />
      </NavLink>

      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          MOVIES
        </NavLink>
        <span className="separator">|</span>

        <div className="genre-dropdown">
          <button
            type="button"
            className={`nav-link genre-button ${selectedGenreId ? 'active' : ''}`}
          >
            {selectedGenre ? selectedGenre.name : 'GENRE'} ▼
          </button>

          <div className="genre-menu">
            <button
              className={`genre-item ${!selectedGenreId ? 'active' : ''}`}
              onClick={() => handleGenreSelect(null)}
            >
              All Genres
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                className={`genre-item ${selectedGenreId === String(genre.id) ? 'active' : ''}`}
                onClick={() => handleGenreSelect(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="auth-links">
        {isAuthenticated ? (
          <button type="button" onClick={handleLogout} className="nav-link">
            LOGOUT
          </button>
        ) : (
          <>
            <NavLink to="/register" className="nav-link">SIGN UP</NavLink>
            <span className="separator">|</span>
            <NavLink to="/login" className="nav-link">SIGN IN</NavLink>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
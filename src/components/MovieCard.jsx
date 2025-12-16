import { useNavigate } from 'react-router-dom'
import './MovieCard.css'
import { getImageUrl } from '../utils/imageUrl'

function MovieCard({ movie, selectedDate }) {
  const navigate = useNavigate()
  const firstScreening =
    (movie.screenings && movie.screenings[0]) || null

  const startText = firstScreening
    ? new Date(firstScreening.start_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'XXXX'

  const handleClick = () => {
    navigate(`/movie/${movie.id}?date=${selectedDate}`)
  }

  return (
    <article className="movie-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="poster-wrapper">
        {movie.poster_url ? (
          <img src={getImageUrl(movie.poster_url)} alt={movie.title} />
        ) : (
          <div className="poster-placeholder">{movie.title}</div>
        )}
      </div>

      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-starts">
          MOVIE STARTS ({selectedDate}): {startText}
        </p>
      </div>
    </article>
  )
}

export default MovieCard
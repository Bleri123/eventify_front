import './Pagination.css'
import prevIcon from '../assets/previous-icon.svg'
import nextIcon from '../assets/next-icon.svg'

function Pagination({ current, last, onChange }) {
  const pages = []
  for (let p = 1; p <= last; p++) {
    if (p === 1 || p === last || Math.abs(p - current) <= 2) {
      pages.push(p)
    }
  }

  return (
    <nav className="pagination">
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        <img src={prevIcon} alt="Previous page" className="pagination-icon" />
        <span>Previous</span>
      </button>

      {pages.map((p, idx) => {
        const prev = pages[idx - 1]
        const showDots = prev && p - prev > 1

        return (
          <span key={p}>
            {showDots && <span className="dots">…</span>}
            <button
              className={p === current ? 'page active' : 'page'}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </span>
        )
      })}

      <button
        disabled={current === last}
        onClick={() => onChange(current + 1)}
      >
        <span>Next</span>
        <img src={nextIcon} alt="Next page" className="pagination-icon" />
      </button>
    </nav>
  )
}

export default Pagination
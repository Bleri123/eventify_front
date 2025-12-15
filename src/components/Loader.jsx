import './Loader.css'

function Loader() {
  return (
    <div className="loader-wrapper">
      <div className="loader-spinner" />
      <span className="loader-text">Loading movies…</span>
    </div>
  )
}

export default Loader
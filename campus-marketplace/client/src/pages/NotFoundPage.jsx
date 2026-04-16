import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="cm-container cm-container--narrow">
      <div className="cm-empty">
        <div className="cm-empty__icon">🧭</div>
        <h1 className="cm-empty__title">Page Not Found</h1>
        <p className="cm-empty__msg">The route you requested does not exist.</p>
        <Link className="cm-btn cm-btn--primary" to="/">Go Home</Link>
      </div>
    </div>
  )
}

export default function EmptyState({ title, message, action }) {
  return (
    <div className="cm-empty">
      <div className="cm-empty__icon">📭</div>
      <h3 className="cm-empty__title">{title}</h3>
      <p className="cm-empty__msg">{message}</p>
      {action}
    </div>
  )
}

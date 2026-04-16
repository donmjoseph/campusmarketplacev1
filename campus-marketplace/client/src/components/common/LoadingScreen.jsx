export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="cm-site">
      <main className="cm-main">
        <div className="cm-container cm-text-center">
          <div className="cm-panel cm-container--narrow">
            <p className="cm-text-muted">{message}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

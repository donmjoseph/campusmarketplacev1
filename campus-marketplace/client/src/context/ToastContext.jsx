import { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'default', duration = 3200) => {
    const id = crypto.randomUUID()
    const toast = { id, message, type }
    setToasts((prev) => [...prev, toast])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, duration)
  }

  const value = useMemo(() => ({ showToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div id="cm-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`cm-toast cm-toast--${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : 'ℹ'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

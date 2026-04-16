import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './common/LoadingScreen'

export default function ProtectedRoute({ children, allowRoles = [] }) {
  const { booting, isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (booting) {
    return <LoadingScreen message="Checking account..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowRoles.length > 0 && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

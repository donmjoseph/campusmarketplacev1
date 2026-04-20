import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'
import { usePageTitle } from '../utils/usePageTitle'

export default function LoginPage() {
  usePageTitle('Sign In')
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const user = await login({ email, password })
      showToast('Logged in successfully.', 'success')

      const from = location.state?.from
      if (from) {
        navigate(from, { replace: true })
        return
      }

      if (user.role === 'seller') {
        navigate('/seller/dashboard')
        return
      }

      if (user.role === 'admin') {
        navigate('/admin/dashboard')
        return
      }

      navigate('/browse')
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to log in.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cm-container cm-container--narrow">
      <div className="cm-page-header">
        <h1 className="cm-page-header__title">Sign In</h1>
        <p className="cm-page-header__sub">Use your WSU email account.</p>
      </div>

      <form className="cm-form-panel" onSubmit={handleSubmit}>
        <div className="cm-form__group">
          <label className="cm-form__label" htmlFor="login-email">WSU Email</label>
          <input
            id="login-email"
            className="cm-form__input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="cm-form__group">
          <label className="cm-form__label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="cm-form__input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button className="cm-btn cm-btn--primary cm-btn--full" disabled={loading} type="submit">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="cm-text-center cm-text-sm cm-mt-16">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>

      <div className="cm-panel cm-mt-20">
        <p className="cm-font-bold cm-mb-8">Demo Credentials</p>
        <p className="cm-text-sm">Buyer: <code>buyer1@wsu.edu / password123</code></p>
        <p className="cm-text-sm">Seller: <code>seller1@wsu.edu / password123</code></p>
        <p className="cm-text-sm">Admin: <code>admin1@wsu.edu / admin123</code></p>
      </div>
    </div>
  )
}

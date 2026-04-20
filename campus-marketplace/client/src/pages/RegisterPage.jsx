import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'
import { usePageTitle } from '../utils/usePageTitle'

const WSU_EMAIL_REGEX = /^[^\s@]+@(wsu\.edu|email\.wsu\.edu|vet\.wsu\.edu)$/i

export default function RegisterPage() {
  usePageTitle('Create Account')
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
  })
  const [loading, setLoading] = useState(false)

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.name.trim().length < 2) {
      showToast('Name must be at least 2 characters.', 'warning')
      return
    }

    if (!WSU_EMAIL_REGEX.test(form.email.trim())) {
      showToast('Please use a valid WSU email (for example name@wsu.edu).', 'warning')
      return
    }

    if (form.password.length < 8) {
      showToast('Password must be at least 8 characters.', 'warning')
      return
    }

    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match.', 'warning')
      return
    }

    setLoading(true)

    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      })

      showToast('Account created successfully.', 'success')
      if (user.role === 'seller') {
        navigate('/seller/dashboard')
      } else {
        navigate('/browse')
      }
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to register.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cm-container cm-container--narrow">
      <div className="cm-page-header">
        <h1 className="cm-page-header__title">Create Account</h1>
        <p className="cm-page-header__sub">Register with a WSU email address.</p>
      </div>

      <form className="cm-form-panel" onSubmit={handleSubmit}>
        <div className="cm-form__group">
          <label className="cm-form__label" htmlFor="register-name">Display Name</label>
          <input
            id="register-name"
            className="cm-form__input"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
          />
        </div>

        <div className="cm-form__group">
          <label className="cm-form__label" htmlFor="register-email">WSU Email</label>
          <input
            id="register-email"
            className="cm-form__input"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            required
          />
        </div>

        <div className="cm-form__group">
          <label className="cm-form__label" htmlFor="register-role">Role</label>
          <select
            id="register-role"
            className="cm-form__select"
            value={form.role}
            onChange={(event) => updateField('role', event.target.value)}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        <div className="cm-form__row">
          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              className="cm-form__input"
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              required
            />
          </div>

          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              className="cm-form__input"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              required
            />
          </div>
        </div>

        <button className="cm-btn cm-btn--primary cm-btn--full" disabled={loading} type="submit">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="cm-text-center cm-text-sm cm-mt-16">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}

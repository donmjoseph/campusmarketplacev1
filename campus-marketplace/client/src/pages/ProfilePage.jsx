import { useEffect, useState } from 'react'
import http from '../api/http'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    notifications: {
      orderUpdates: true,
      messages: true,
      promotions: false,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data } = await http.get('/users/me')
        const next = data.user
        setForm({
          name: next.name || '',
          email: next.email || '',
          phone: next.profile?.phone || '',
          location: next.profile?.location || '',
          bio: next.profile?.bio || '',
          notifications: {
            orderUpdates: Boolean(next.notificationPrefs?.orderUpdates),
            messages: Boolean(next.notificationPrefs?.messages),
            promotions: Boolean(next.notificationPrefs?.promotions),
          },
        })
      } catch (error) {
        showToast(getErrorMessage(error, 'Failed to load profile.'), 'error')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [showToast, user])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleNotification = (field) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field],
      },
    }))
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await http.patch('/users/me', {
        name: form.name,
        email: form.email,
        profile: {
          phone: form.phone,
          location: form.location,
          bio: form.bio,
        },
        notificationPrefs: {
          orderUpdates: form.notifications.orderUpdates,
          messages: form.notifications.messages,
          promotions: form.notifications.promotions,
        },
      })
      await refreshUser()
      showToast('Profile updated.', 'success')
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to update profile.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return <div className="cm-container"><p className="cm-text-muted">Please sign in to manage your profile.</p></div>
  }

  if (loading) {
    return <div className="cm-container"><p className="cm-text-muted">Loading profile...</p></div>
  }

  return (
    <div className="cm-container cm-container--narrow">
      <div className="cm-page-header">
        <h1 className="cm-page-header__title">Profile</h1>
        <p className="cm-page-header__sub">Manage your account details and preferences.</p>
      </div>

      <form className="cm-form-panel" onSubmit={saveProfile}>
        <div className="cm-form__row">
          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="profile-name">Display Name</label>
            <input id="profile-name" className="cm-form__input" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          </div>
          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="profile-email">Email</label>
            <input id="profile-email" className="cm-form__input" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          </div>
        </div>

        <div className="cm-form__row">
          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="profile-phone">Phone</label>
            <input id="profile-phone" className="cm-form__input" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
          </div>
          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="profile-location">Location</label>
            <input id="profile-location" className="cm-form__input" value={form.location} onChange={(event) => updateField('location', event.target.value)} />
          </div>
        </div>

        <div className="cm-form__group">
          <label className="cm-form__label" htmlFor="profile-bio">Bio</label>
          <textarea id="profile-bio" className="cm-form__textarea" value={form.bio} onChange={(event) => updateField('bio', event.target.value)} />
        </div>

        <hr className="cm-form__divider" />

        <h2 className="cm-form__section-title">Notifications</h2>
        <div className="cm-form__group">
          <label className="cm-flex cm-gap-8">
            <input type="checkbox" checked={form.notifications.orderUpdates} onChange={() => toggleNotification('orderUpdates')} />
            Order updates
          </label>
          <label className="cm-flex cm-gap-8">
            <input type="checkbox" checked={form.notifications.messages} onChange={() => toggleNotification('messages')} />
            Message notifications
          </label>
          <label className="cm-flex cm-gap-8">
            <input type="checkbox" checked={form.notifications.promotions} onChange={() => toggleNotification('promotions')} />
            Promotions
          </label>
        </div>

        <button className="cm-btn cm-btn--primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { friendlyDate, statusBadgeClass, titleCase } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { usePageTitle } from '../../utils/usePageTitle'

export default function AdminUsersPage() {
  usePageTitle('Manage Users')
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ q: '', role: '', status: '' })
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
      const { data } = await http.get(`/admin/users?${params.toString()}`)
      setUsers(data.users || [])
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load users.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.role, filters.status])

  const setUserStatus = async (userId, status) => {
    let suspensionReason = ''
    if (status === 'suspended') {
      suspensionReason = window.prompt('Enter suspension reason:') || ''
      if (!suspensionReason) return
    }

    try {
      await http.patch(`/admin/users/${userId}/status`, { status, suspensionReason })
      showToast(`User set to ${status}.`, status === 'suspended' ? 'warning' : 'success')
      await loadUsers()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to update user status.'), 'error')
    }
  }

  return (
    <div className="cm-dash-section">
      <div className="cm-dash-section__head">
        <h2 className="cm-dash-section__title">Manage Users</h2>
      </div>

      <div className="cm-dash-section__body">
        <div className="cm-form__row cm-mb-20">
          <div className="cm-form__group">
            <label className="cm-form__label">Search</label>
            <input className="cm-form__input" value={filters.q} onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))} />
          </div>
          <div className="cm-form__group">
            <label className="cm-form__label">Role</label>
            <select className="cm-form__select" value={filters.role} onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}>
              <option value="">All</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="cm-form__group">
            <label className="cm-form__label">Status</label>
            <select className="cm-form__select" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="cm-text-muted">Loading users...</p>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={6} className="cm-table__empty">No users found.</td></tr>
                )}
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{titleCase(user.role)}</td>
                    <td><span className={statusBadgeClass(user.status)}>{titleCase(user.status)}</span></td>
                    <td>{friendlyDate(user.createdAt)}</td>
                    <td>
                      <div className="cm-table__actions">
                        {user.status === 'active' ? (
                          <button className="cm-btn cm-btn--danger cm-btn--sm" type="button" onClick={() => setUserStatus(user._id, 'suspended')}>
                            Suspend
                          </button>
                        ) : (
                          <button className="cm-btn cm-btn--success cm-btn--sm" type="button" onClick={() => setUserStatus(user._id, 'active')}>
                            Reinstate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

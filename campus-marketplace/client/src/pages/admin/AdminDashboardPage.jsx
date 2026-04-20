import { useEffect, useState } from 'react'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { friendlyDate, statusBadgeClass, titleCase } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

export default function AdminDashboardPage() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        const response = await http.get('/admin/dashboard')
        setData(response.data)
      } catch (error) {
        showToast(getErrorMessage(error, 'Unable to load admin dashboard.'), 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [showToast])

  if (loading) {
    return <p className="cm-text-muted">Loading admin dashboard...</p>
  }

  if (!data) {
    return <p className="cm-text-muted">No dashboard data available.</p>
  }

  return (
    <>
      <div className="cm-stats-grid">
        <div className="cm-stat"><div className="cm-stat__val">{data.stats.totalUsers}</div><div className="cm-stat__label">Users</div></div>
        <div className="cm-stat cm-stat--green"><div className="cm-stat__val">{data.stats.activeListings}</div><div className="cm-stat__label">Active Listings</div></div>
        <div className="cm-stat cm-stat--blue"><div className="cm-stat__val">{data.stats.totalOrders}</div><div className="cm-stat__label">Orders</div></div>
        <div className="cm-stat cm-stat--orange"><div className="cm-stat__val">{data.stats.pendingReports}</div><div className="cm-stat__label">Pending Reports</div></div>
      </div>

      <div className="cm-dash-section">
        <div className="cm-dash-section__head">
          <h3 className="cm-dash-section__title">Recent Registrations</h3>
        </div>
        <div className="cm-dash-section__body">
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{titleCase(user.role)}</td>
                    <td><span className={statusBadgeClass(user.status)}>{titleCase(user.status)}</span></td>
                    <td>{friendlyDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="cm-dash-section">
        <div className="cm-dash-section__head">
          <h3 className="cm-dash-section__title">Recent Orders</h3>
        </div>
        <div className="cm-dash-section__body">
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.buyer?.name || '—'}</td>
                    <td>{order.seller?.name || '—'}</td>
                    <td>{order.listing?.title || order.titleSnapshot || '—'}</td>
                    <td><span className={statusBadgeClass(order.status)}>{titleCase(order.status)}</span></td>
                    <td>{friendlyDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

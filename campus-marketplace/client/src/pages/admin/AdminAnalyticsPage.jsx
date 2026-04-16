import { useEffect, useState } from 'react'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { currency } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

export default function AdminAnalyticsPage() {
  const { showToast } = useToast()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        const { data } = await http.get('/admin/analytics')
        setAnalytics(data)
      } catch (error) {
        showToast(getErrorMessage(error, 'Unable to load analytics.'), 'error')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [showToast])

  if (loading) {
    return <p className="cm-text-muted">Loading analytics...</p>
  }

  if (!analytics) {
    return <p className="cm-text-muted">Analytics unavailable.</p>
  }

  const maxCategory = Math.max(...analytics.byCategory.map((item) => item.count), 1)

  return (
    <>
      <div className="cm-stats-grid">
        <div className="cm-stat"><div className="cm-stat__val">{analytics.metrics.totalUsers}</div><div className="cm-stat__label">Users</div></div>
        <div className="cm-stat cm-stat--green"><div className="cm-stat__val">{analytics.metrics.activeListings}</div><div className="cm-stat__label">Active Listings</div></div>
        <div className="cm-stat cm-stat--blue"><div className="cm-stat__val">{analytics.metrics.totalOrders}</div><div className="cm-stat__label">Orders</div></div>
        <div className="cm-stat cm-stat--orange"><div className="cm-stat__val">{currency(analytics.metrics.totalRevenue)}</div><div className="cm-stat__label">Gross Merchandise Value</div></div>
      </div>

      <div className="cm-dash-section">
        <div className="cm-dash-section__head">
          <h3 className="cm-dash-section__title">Listings by Category</h3>
        </div>
        <div className="cm-dash-section__body">
          <div className="cm-chart">
            {analytics.byCategory.map((item) => (
              <div
                key={item._id}
                className="cm-bar"
                title={`${item._id}: ${item.count}`}
                style={{ height: `${Math.max(8, (item.count / maxCategory) * 100)}%` }}
              />
            ))}
          </div>
          <div className="cm-bar-labels">
            {analytics.byCategory.map((item) => (
              <div key={item._id} className="cm-bar-label">{item._id}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="cm-dash-section">
        <div className="cm-dash-section__head">
          <h3 className="cm-dash-section__title">Orders by Month</h3>
        </div>
        <div className="cm-dash-section__body">
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Month</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.byMonth.map((item) => (
                  <tr key={`${item._id.year}-${item._id.month}`}>
                    <td>{item._id.year}</td>
                    <td>{item._id.month}</td>
                    <td>{item.count}</td>
                    <td>{currency(item.revenue)}</td>
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

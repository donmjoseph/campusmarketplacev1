import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { currency } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { usePageTitle } from '../../utils/usePageTitle'

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  fulfilled: '#10b981',
  cancelled: '#ef4444',
  cancellation_requested: '#f97316',
}

const BAR_COLOR = '#8b1a1a'
const USER_COLOR = '#5a3e8c'

export default function AdminAnalyticsPage() {
  usePageTitle('Analytics')
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

  if (loading) return <p className="cm-text-muted">Loading analytics...</p>
  if (!analytics) return <p className="cm-text-muted">Analytics unavailable.</p>

  const pieData = analytics.ordersByStatus.map((item) => ({
    name: item._id,
    value: item.count,
    fill: STATUS_COLORS[item._id] || '#94a3b8',
  }))

  return (
    <>
      {/* ── KPI stats ─────────────────────────────────────────────── */}
      <div className="cm-stats-grid">
        <div className="cm-stat">
          <div className="cm-stat__val">{analytics.metrics.totalUsers}</div>
          <div className="cm-stat__label">Total Users</div>
        </div>
        <div className="cm-stat cm-stat--blue">
          <div className="cm-stat__val">{analytics.metrics.totalOrders}</div>
          <div className="cm-stat__label">Total Orders</div>
        </div>
        <div className="cm-stat cm-stat--orange">
          <div className="cm-stat__val">{currency(analytics.metrics.totalRevenue)}</div>
          <div className="cm-stat__label">Gross Revenue</div>
        </div>
        <div className="cm-stat cm-stat--green">
          <div className="cm-stat__val">{currency(analytics.metrics.avgOrderValue)}</div>
          <div className="cm-stat__label">Avg Order Value</div>
        </div>
      </div>

      {/* ── Revenue over last 30 days ──────────────────────────────── */}
      <div className="cm-dash-section">
        <div className="cm-dash-section__head">
          <h3 className="cm-dash-section__title">Revenue — Last 30 Days</h3>
        </div>
        <div className="cm-dash-section__body">
          {analytics.revenueByDay.length === 0 ? (
            <p className="cm-text-muted">No order data in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.revenueByDay} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [currency(value), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke={BAR_COLOR} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── New users over last 30 days ────────────────────────────── */}
      <div className="cm-dash-section">
        <div className="cm-dash-section__head">
          <h3 className="cm-dash-section__title">New Users — Last 30 Days</h3>
        </div>
        <div className="cm-dash-section__body">
          {analytics.usersByDay.length === 0 ? (
            <p className="cm-text-muted">No new registrations in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.usersByDay} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [value, 'New Users']} />
                <Line type="monotone" dataKey="count" stroke={USER_COLOR} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* ── Orders by status (pie) ─────────────────────────────── */}
        <div className="cm-dash-section">
          <div className="cm-dash-section__head">
            <h3 className="cm-dash-section__title">Orders by Status</h3>
          </div>
          <div className="cm-dash-section__body">
            {pieData.length === 0 ? (
              <p className="cm-text-muted">No order data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Top 5 listings by order count ─────────────────────── */}
        <div className="cm-dash-section">
          <div className="cm-dash-section__head">
            <h3 className="cm-dash-section__title">Top 5 Listings by Orders</h3>
          </div>
          <div className="cm-dash-section__body">
            {analytics.topListings.length === 0 ? (
              <p className="cm-text-muted">No order data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={analytics.topListings.map((item) => ({ name: item.title || 'Unknown', orders: item.count }))}
                  margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="orders" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

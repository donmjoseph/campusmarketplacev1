import { useEffect, useState } from 'react'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { currency, friendlyDate, statusBadgeClass, titleCase } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

export default function AdminOrdersPage() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [filters, setFilters] = useState({ q: '', status: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value)
        })
        const { data } = await http.get(`/admin/orders?${params.toString()}`)
        setOrders(data.orders || [])
      } catch (error) {
        showToast(getErrorMessage(error, 'Unable to load orders.'), 'error')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [filters, showToast])

  return (
    <div className="cm-dash-section">
      <div className="cm-dash-section__head">
        <h2 className="cm-dash-section__title">All Orders</h2>
      </div>
      <div className="cm-dash-section__body">
        <div className="cm-form__row cm-mb-20">
          <div className="cm-form__group">
            <label className="cm-form__label">Search</label>
            <input className="cm-form__input" value={filters.q} onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))} />
          </div>
          <div className="cm-form__group">
            <label className="cm-form__label">Status</label>
            <select className="cm-form__select" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
              <option value="cancellation_requested">Cancellation Requested</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="cm-text-muted">Loading orders...</p>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.buyer?.name}</td>
                    <td>{order.seller?.name}</td>
                    <td>{order.listing?.title || order.titleSnapshot}</td>
                    <td><span className={statusBadgeClass(order.status)}>{titleCase(order.status)}</span></td>
                    <td>{currency(order.priceSnapshot)}</td>
                    <td>{friendlyDate(order.createdAt)}</td>
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

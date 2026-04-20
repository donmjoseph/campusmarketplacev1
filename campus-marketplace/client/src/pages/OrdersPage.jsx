import { useEffect, useMemo, useState } from 'react'
import http from '../api/http'
import EmptyState from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { friendlyDate, statusBadgeClass, titleCase, currency } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export default function OrdersPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancelReason, setCancelReason] = useState({})

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders
    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  const loadOrders = async () => {
    if (!user || user.role !== 'buyer') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data } = await http.get('/orders/buyer')
      setOrders(data.orders || [])
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load orders.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const requestCancellation = async (orderId) => {
    const reason = cancelReason[orderId]
    if (!reason || reason.trim().length < 5) {
      showToast('Please enter a short cancellation reason.', 'warning')
      return
    }

    try {
      await http.patch(`/orders/${orderId}/cancel-request`, { reason })
      showToast('Cancellation request submitted.', 'success')
      await loadOrders()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to request cancellation.'), 'error')
    }
  }

  if (!user || user.role !== 'buyer') {
    return (
      <div className="cm-container">
        <EmptyState title="Buyer Orders Only" message="Sign in as a buyer to view your orders." />
      </div>
    )
  }

  return (
    <div className="cm-container">
      <div className="cm-page-header">
        <h1 className="cm-page-header__title">Order History</h1>
        <p className="cm-page-header__sub">Track order status and request cancellations.</p>
      </div>

      <div className="cm-panel cm-mb-20">
        <div className="cm-form__group cm-mb-0">
          <label className="cm-form__label" htmlFor="status-filter">Filter by Status</label>
          <select
            id="status-filter"
            className="cm-form__select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
            <option value="cancellation_requested">Cancellation Requested</option>
          </select>
        </div>
      </div>

      {loading && <p className="cm-text-muted">Loading orders...</p>}
      {!loading && filteredOrders.length === 0 && (
        <EmptyState title="No Orders Found" message="Your recent orders will appear here." />
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Item</th>
                <th>Seller</th>
                <th>Status</th>
                <th>Price</th>
                <th>Placed</th>
                <th>Cancellation</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.listing?.title || order.titleSnapshot}</td>
                  <td>{order.seller?.name}</td>
                  <td><span className={statusBadgeClass(order.status)}>{titleCase(order.status)}</span></td>
                  <td>{currency(order.priceSnapshot)}</td>
                  <td>{friendlyDate(order.createdAt)}</td>
                  <td>
                    {order.status === 'pending' ? (
                      <div className="cm-flex cm-gap-8">
                        <input
                          className="cm-form__input"
                          placeholder="Reason"
                          value={cancelReason[order._id] || ''}
                          onChange={(event) => setCancelReason((prev) => ({ ...prev, [order._id]: event.target.value }))}
                        />
                        <button className="cm-btn cm-btn--danger cm-btn--sm" type="button" onClick={() => requestCancellation(order._id)}>
                          Request
                        </button>
                      </div>
                    ) : (
                      <span className="cm-text-muted">{order.cancellation?.requested ? titleCase(order.cancellation.decision || 'pending') : 'N/A'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

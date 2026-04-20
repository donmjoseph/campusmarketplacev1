import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { currency, friendlyDate, statusBadgeClass, titleCase } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { usePageTitle } from '../../utils/usePageTitle'

export default function SellerDashboardPage() {
  usePageTitle('Seller Dashboard')
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [tab, setTab] = useState('overview')
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [listingRes, orderRes, messageRes] = await Promise.all([
        http.get('/listings?mine=true'),
        http.get('/orders/seller'),
        http.get('/messages/conversations'),
      ])
      setListings(listingRes.data.listings || [])
      setOrders(orderRes.data.orders || [])
      setConversations(messageRes.data.conversations || [])
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to load seller dashboard.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const revenue = orders
      .filter((order) => order.status === 'fulfilled')
      .reduce((sum, order) => sum + order.priceSnapshot, 0)

    return {
      revenue,
      activeListings: listings.filter((listing) => listing.status === 'active').length,
      pendingOrders: orders.filter((o) => ['pending', 'confirmed', 'cancellation_requested'].includes(o.status)).length,
      unreadMessages: conversations.filter((conversation) => conversation.unread).length,
    }
  }, [conversations, listings, orders])

  const markFulfilled = async (orderId) => {
    try {
      await http.patch(`/orders/${orderId}/fulfill`)
      showToast('Order marked as fulfilled.', 'success')
      await loadData()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to fulfill order.'), 'error')
    }
  }

  const handleCancellationDecision = async (orderId, decision) => {
    try {
      await http.patch(`/orders/${orderId}/cancel-decision`, { decision })
      showToast(`Cancellation ${decision}.`, 'success')
      await loadData()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to review cancellation.'), 'error')
    }
  }

  const deleteListing = async (listingId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await http.delete(`/listings/${listingId}`)
      showToast('Listing deleted.', 'success')
      await loadData()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to delete listing.'), 'error')
    }
  }

  const confirmOrder = async (orderId) => {
    try {
      await http.patch(`/orders/${orderId}/confirm`)
      showToast('Order confirmed.', 'success')
      await loadData()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to confirm order.'), 'error')
    }
  }

  return (
    <div>
      <div className="cm-tabs" data-tab-group="seller-tabs">
        {['overview', 'listings', 'orders', 'messages'].map((item) => (
          <button
            key={item}
            type="button"
            className={`cm-tab ${tab === item ? 'cm-tab--active' : ''}`}
            onClick={() => setTab(item)}
          >
            {titleCase(item)}
          </button>
        ))}
      </div>

      {loading && <p className="cm-text-muted">Loading dashboard...</p>}

      {!loading && tab === 'overview' && (
        <>
          <div className="cm-stats-grid">
            <div className="cm-stat">
              <div className="cm-stat__val">{currency(stats.revenue)}</div>
              <div className="cm-stat__label">Revenue</div>
            </div>
            <div className="cm-stat cm-stat--green">
              <div className="cm-stat__val">{stats.activeListings}</div>
              <div className="cm-stat__label">Active Listings</div>
            </div>
            <div className="cm-stat cm-stat--orange">
              <div className="cm-stat__val">{stats.pendingOrders}</div>
              <div className="cm-stat__label">Pending Orders</div>
            </div>
            <div className="cm-stat cm-stat--blue">
              <div className="cm-stat__val">{stats.unreadMessages}</div>
              <div className="cm-stat__label">Unread Messages</div>
            </div>
          </div>

          <div className="cm-dash-section">
            <div className="cm-dash-section__head">
              <h3 className="cm-dash-section__title">Quick Actions</h3>
            </div>
            <div className="cm-dash-section__body cm-flex cm-gap-12">
              <Link className="cm-btn cm-btn--primary" to="/seller/listings/new">Create Listing</Link>
              <button type="button" className="cm-btn cm-btn--secondary" onClick={() => setTab('orders')}>View Orders</button>
              <button type="button" className="cm-btn cm-btn--ghost" onClick={() => navigate('/messages')}>Open Messages</button>
            </div>
          </div>
        </>
      )}

      {!loading && tab === 'listings' && (
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Price</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 && (
                <tr><td colSpan={5} className="cm-table__empty">No listings yet. <a href="/seller/listings/new">Create one.</a></td></tr>
              )}
              {listings.map((listing) => (
                <tr key={listing._id}>
                  <td>{listing.title}</td>
                  <td><span className={statusBadgeClass(listing.status)}>{titleCase(listing.status)}</span></td>
                  <td>{currency(listing.price)}</td>
                  <td>{friendlyDate(listing.createdAt)}</td>
                  <td>
                    <div className="cm-table__actions">
                      <Link className="cm-btn cm-btn--secondary cm-btn--sm" to={`/seller/listings/${listing._id}/edit`}>
                        Edit
                      </Link>
                      {listing.status !== 'sold' && (
                        <button className="cm-btn cm-btn--danger cm-btn--sm" type="button" onClick={() => deleteListing(listing._id, listing.title)}>
                          Delete
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

      {!loading && tab === 'orders' && (
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Buyer</th>
                <th>Item</th>
                <th>Status</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={6} className="cm-table__empty">No orders yet.</td></tr>
              )}
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.buyer?.name}</td>
                  <td>{order.listing?.title || order.titleSnapshot}</td>
                  <td><span className={statusBadgeClass(order.status)}>{titleCase(order.status)}</span></td>
                  <td>{currency(order.priceSnapshot)}</td>
                  <td>
                    <div className="cm-table__actions">
                      {order.status === 'pending' && (
                        <>
                          <button className="cm-btn cm-btn--secondary cm-btn--sm" type="button" onClick={() => confirmOrder(order._id)}>
                            Confirm
                          </button>
                          <button className="cm-btn cm-btn--success cm-btn--sm" type="button" onClick={() => markFulfilled(order._id)}>
                            Fulfill
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button className="cm-btn cm-btn--success cm-btn--sm" type="button" onClick={() => markFulfilled(order._id)}>
                          Fulfill
                        </button>
                      )}

                      {order.status === 'cancellation_requested' && (
                        <>
                          <button className="cm-btn cm-btn--danger cm-btn--sm" type="button" onClick={() => handleCancellationDecision(order._id, 'approved')}>
                            Approve Cancel
                          </button>
                          <button className="cm-btn cm-btn--secondary cm-btn--sm" type="button" onClick={() => handleCancellationDecision(order._id, 'denied')}>
                            Deny
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'messages' && (
        <div className="cm-panel">
          <p className="cm-mb-16">You have {conversations.length} active conversation(s).</p>
          <button className="cm-btn cm-btn--primary" type="button" onClick={() => navigate('/messages')}>
            Open Messaging Center
          </button>
        </div>
      )}
    </div>
  )
}

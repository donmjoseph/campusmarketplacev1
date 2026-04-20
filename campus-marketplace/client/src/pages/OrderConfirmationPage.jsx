import { Link, useLocation } from 'react-router-dom'
import { currency } from '../utils/format'
import { usePageTitle } from '../utils/usePageTitle'

export default function OrderConfirmationPage() {
  usePageTitle('Order Confirmed')
  const location = useLocation()
  const orders = location.state?.orders || []

  return (
    <div className="cm-container cm-container--narrow">
      <div className="cm-panel cm-text-center">
        <h1 className="cm-page-header__title">Order Confirmed</h1>
        <p className="cm-page-header__sub">Your order has been submitted successfully.</p>

        {orders.length > 0 && (
          <div className="cm-mt-20">
            {orders.map((order) => (
              <div key={order._id} className="cm-alert cm-alert--success">
                <div>
                  <p className="cm-font-bold">{order.orderNumber}</p>
                  <p className="cm-text-sm">{order.listing?.title || order.titleSnapshot} • {currency(order.priceSnapshot)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cm-form__actions cm-flex-center cm-mt-20" style={{ justifyContent: 'center' }}>
          <Link className="cm-btn cm-btn--primary" to="/orders">View Orders</Link>
          <Link className="cm-btn cm-btn--secondary" to="/browse">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}

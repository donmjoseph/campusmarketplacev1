import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import http from '../api/http'
import EmptyState from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { currency } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export default function CartPage() {
  const navigate = useNavigate()
  const { user, refreshCartCount } = useAuth()
  const { showToast } = useToast()

  const [items, setItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadCart = async () => {
    if (!user || user.role !== 'buyer') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data } = await http.get('/cart')
      setItems(data.items || [])
      setSubtotal(data.subtotal || 0)
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load cart.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role])

  const removeItem = async (listingId) => {
    try {
      await http.delete(`/cart/items/${listingId}`)
      await refreshCartCount()
      showToast('Item removed from cart.', 'success')
      await loadCart()
    } catch (error) {
      showToast(getErrorMessage(error, 'Could not remove item.'), 'error')
    }
  }

  const clearCart = async () => {
    try {
      await http.delete('/cart/clear')
      await refreshCartCount()
      showToast('Cart cleared.', 'success')
      await loadCart()
    } catch (error) {
      showToast(getErrorMessage(error, 'Could not clear cart.'), 'error')
    }
  }

  if (!user) {
    return (
      <div className="cm-container">
        <EmptyState
          title="Sign In Required"
          message="Log in as a buyer to use the cart."
          action={<Link className="cm-btn cm-btn--primary" to="/login">Go to Login</Link>}
        />
      </div>
    )
  }

  if (user.role !== 'buyer') {
    return (
      <div className="cm-container">
        <EmptyState
          title="Buyer Cart Only"
          message="Switch to a buyer account to checkout listings."
        />
      </div>
    )
  }

  return (
    <div className="cm-container">
      <div className="cm-page-header">
        <h1 className="cm-page-header__title">Your Cart</h1>
        <p className="cm-page-header__sub">Ready to checkout your selected items.</p>
      </div>

      {loading && <p className="cm-text-muted">Loading cart...</p>}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Cart is Empty"
          message="Browse listings to add items to your cart."
          action={<Link to="/browse" className="cm-btn cm-btn--primary">Browse Listings</Link>}
        />
      )}

      {!loading && items.length > 0 && (
        <div className="cm-cart-layout">
          <div className="cm-cart-panel">
            {items.map((item) => (
              <div className="cm-cart-item" key={item.listingId}>
                <div className="cm-cart-item__img">
                  {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : '📦'}
                </div>
                <div className="cm-cart-item__info">
                  <p className="cm-cart-item__title">{item.title}</p>
                  <p className="cm-cart-item__seller">Sold by {item.seller?.name}</p>
                  <p className="cm-cart-item__price">{currency(item.price)}</p>
                </div>
                <button type="button" className="cm-cart-item__remove" onClick={() => removeItem(item.listingId)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <aside className="cm-summary-panel">
            <h3 className="cm-summary-panel__title">Order Summary</h3>
            <div className="cm-summary-row">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="cm-summary-row cm-summary-row--total">
              <span>Total</span>
              <span>{currency(subtotal)}</span>
            </div>
            <div className="cm-form__actions cm-mt-20">
              <button type="button" className="cm-btn cm-btn--primary cm-btn--full" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
              <button type="button" className="cm-btn cm-btn--ghost cm-btn--full" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../api/http'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { currency } from '../utils/format'
import { getErrorMessage } from '../utils/errors'
import { usePageTitle } from '../utils/usePageTitle'

export default function CheckoutPage() {
  usePageTitle('Checkout')
  const navigate = useNavigate()
  const { user, refreshCartCount } = useAuth()
  const { showToast } = useToast()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    method: 'pickup',
    contactName: user?.name || '',
    contactPhone: user?.profile?.phone || '',
    shippingAddress: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items])

  useEffect(() => {
    async function loadCart() {
      if (!user || user.role !== 'buyer') {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        const { data } = await http.get('/cart')
        setItems(data.items || [])
      } catch (error) {
        showToast(getErrorMessage(error, 'Unable to load cart.'), 'error')
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [navigate, showToast, user])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const submitCheckout = async (event) => {
    event.preventDefault()

    if (!items.length) {
      showToast('Your cart is empty.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await http.post('/orders/checkout', form)
      await refreshCartCount()
      showToast('Order placed successfully.', 'success')
      navigate('/order-confirmation', {
        state: { orders: data.orders },
      })
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to complete checkout.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="cm-container"><p className="cm-text-muted">Loading checkout...</p></div>
  }

  return (
    <div className="cm-container">
      <div className="cm-page-header">
        <h1 className="cm-page-header__title">Checkout</h1>
        <p className="cm-page-header__sub">Confirm contact details and delivery preferences.</p>
      </div>

      <div className="cm-cart-layout">
        <form className="cm-form-panel" onSubmit={submitCheckout}>
          <h2 className="cm-form__section-title">Contact Information</h2>
          <div className="cm-form__row">
            <div className="cm-form__group">
              <label className="cm-form__label" htmlFor="checkout-name">Contact Name</label>
              <input
                id="checkout-name"
                className="cm-form__input"
                value={form.contactName}
                onChange={(event) => updateField('contactName', event.target.value)}
                required
              />
            </div>
            <div className="cm-form__group">
              <label className="cm-form__label" htmlFor="checkout-phone">Phone</label>
              <input
                id="checkout-phone"
                className="cm-form__input"
                value={form.contactPhone}
                onChange={(event) => updateField('contactPhone', event.target.value)}
                required
              />
            </div>
          </div>

          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="checkout-method">Fulfillment Method</label>
            <select
              id="checkout-method"
              className="cm-form__select"
              value={form.method}
              onChange={(event) => updateField('method', event.target.value)}
            >
              <option value="pickup">Pickup</option>
              <option value="shipping">Shipping</option>
            </select>
          </div>

          {form.method === 'shipping' && (
            <div className="cm-form__group">
              <label className="cm-form__label" htmlFor="checkout-address">Shipping Address</label>
              <textarea
                id="checkout-address"
                className="cm-form__textarea"
                value={form.shippingAddress}
                onChange={(event) => updateField('shippingAddress', event.target.value)}
                required
              />
            </div>
          )}

          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="checkout-notes">Notes</label>
            <textarea
              id="checkout-notes"
              className="cm-form__textarea"
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
            />
          </div>

          <button className="cm-btn cm-btn--primary" type="submit" disabled={submitting}>
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <aside className="cm-summary-panel">
          <h3 className="cm-summary-panel__title">Order Items</h3>
          {items.map((item) => (
            <div className="cm-summary-row" key={item.listingId}>
              <span>{item.title}</span>
              <span>{currency(item.price)}</span>
            </div>
          ))}
          <div className="cm-summary-row cm-summary-row--total">
            <span>Total</span>
            <span>{currency(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

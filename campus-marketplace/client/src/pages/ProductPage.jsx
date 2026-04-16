import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import http from '../api/http'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { currency, statusBadgeClass } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, refreshCartCount } = useAuth()
  const { showToast } = useToast()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true)
        const { data } = await http.get(`/listings/${id}`)
        setListing(data.listing)
      } catch (error) {
        showToast(getErrorMessage(error, 'Listing not found.'), 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id, showToast])

  const addToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }

    if (user.role !== 'buyer') {
      showToast('Only buyers can add to cart.', 'warning')
      return
    }

    try {
      await http.post('/cart/items', { listingId: listing._id })
      await refreshCartCount()
      showToast('Item added to cart.', 'success')
    } catch (error) {
      showToast(getErrorMessage(error, 'Could not add item to cart.'), 'error')
    }
  }

  const contactSeller = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }

    try {
      const { data } = await http.post('/messages/conversations', {
        listingId: listing._id,
      })
      navigate(`/messages?conversation=${data.conversation._id}`)
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to start conversation.'), 'error')
    }
  }

  if (loading) {
    return <div className="cm-container"><p className="cm-text-muted">Loading listing...</p></div>
  }

  if (!listing) {
    return (
      <div className="cm-container">
        <div className="cm-panel">Listing unavailable.</div>
      </div>
    )
  }

  return (
    <div className="cm-container">
      <div className="cm-breadcrumb">
        <Link to="/browse">Browse</Link>
        <span className="cm-breadcrumb__sep">/</span>
        <span>{listing.title}</span>
      </div>

      <div className="cm-product-detail">
        <div className="cm-gallery">
          <div className="cm-gallery__main">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
            ) : '📦'}
          </div>
        </div>

        <div className="cm-product-info">
          <p className="cm-product-info__category">{listing.category}</p>
          <h1 className="cm-product-info__title">{listing.title}</h1>
          <p className="cm-product-info__price">{currency(listing.price)}</p>
          <div className="cm-product-info__meta">
            <span className={statusBadgeClass(listing.status)}>{listing.status}</span>
            <span className={statusBadgeClass(listing.condition.toLowerCase().replace(' ', '-'))}>{listing.condition}</span>
            <span className="cm-text-muted">Views: {listing.views}</span>
          </div>
          <p className="cm-product-info__desc">{listing.description}</p>

          <div className="cm-form__actions">
            <button type="button" className="cm-btn cm-btn--primary" onClick={addToCart} disabled={listing.status !== 'active'}>
              Add to Cart
            </button>
            <button type="button" className="cm-btn cm-btn--secondary" onClick={contactSeller}>
              Contact Seller
            </button>
          </div>

          <div className="cm-seller-card">
            <div className="cm-seller-card__avatar">{listing.seller?.name?.slice(0, 1) || 'S'}</div>
            <div>
              <p className="cm-seller-card__name">{listing.seller?.name}</p>
              <p className="cm-seller-card__meta">{listing.seller?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

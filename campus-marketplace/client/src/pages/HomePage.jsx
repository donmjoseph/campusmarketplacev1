import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import http from '../api/http'
import { currency, conditionBadgeClass } from '../utils/format'
import { usePageTitle } from '../utils/usePageTitle'

const CATEGORIES = [
  { label: 'Books', icon: '📚', value: 'Books' },
  { label: 'Electronics', icon: '💻', value: 'Electronics' },
  { label: 'Furniture', icon: '🪑', value: 'Furniture' },
  { label: 'Clothing', icon: '👕', value: 'Clothing' },
  { label: 'Sports', icon: '⚽', value: 'Sports' },
  { label: 'Other', icon: '📦', value: 'Other' },
]

export default function HomePage() {
  usePageTitle('Home')
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data } = await http.get('/listings?sort=newest&limit=6')
        setFeatured(data.listings || [])
      } catch {
        // silently degrade — hero and categories still render
      } finally {
        setLoadingFeatured(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <>
      <section className="cm-hero">
        <div className="cm-container cm-hero__content">
          <span className="cm-hero__eyebrow">WSU Student Marketplace</span>
          <h1 className="cm-hero__title">Buy, Sell, and Trade on Campus</h1>
          <p className="cm-hero__sub">
            Find textbooks, electronics, furniture, and more from fellow WSU students.
          </p>
          <div className="cm-hero__actions">
            <Link to="/browse" className="cm-btn cm-btn--primary cm-btn--lg">Browse Listings</Link>
            <Link to="/register" className="cm-btn cm-btn--secondary cm-btn--lg">Create Account</Link>
          </div>
        </div>
      </section>

      <section className="cm-container cm-mt-40">
        <div className="cm-section-head">
          <h2 className="cm-section-head__title">Shop by Category</h2>
          <div className="cm-section-head__bar" />
          <p className="cm-section-head__sub">
            Browse listings organized by what you need.
          </p>
        </div>

        <div className="cm-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/browse?category=${encodeURIComponent(cat.value)}`}
              className="cm-stat"
              style={{ textDecoration: 'none', textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{cat.icon}</div>
              <div className="cm-stat__val" style={{ fontSize: '1rem' }}>{cat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cm-container cm-mt-40">
        <div className="cm-section-head">
          <h2 className="cm-section-head__title">Featured Listings</h2>
          <div className="cm-section-head__bar" />
          <p className="cm-section-head__sub">
            Freshly posted items from WSU students near you.
          </p>
        </div>

        {loadingFeatured && (
          <p className="cm-text-muted" style={{ textAlign: 'center' }}>Loading listings...</p>
        )}

        {!loadingFeatured && featured.length === 0 && (
          <p className="cm-text-muted" style={{ textAlign: 'center' }}>No listings yet. Be the first to post!</p>
        )}

        <div className="cm-products-grid">
          {featured.map((listing) => (
            <Link to={`/product/${listing._id}`} key={listing._id} className="cm-product-card">
              <div className="cm-product-card__img">
                {listing.images?.[0]
                  ? <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
                  : <span style={{ fontSize: '2rem' }}>📦</span>}
              </div>
              <div className="cm-product-card__body">
                <p className="cm-product-card__cat">{listing.category}</p>
                <h3 className="cm-product-card__title">{listing.title}</h3>
                <p className="cm-product-card__price">{currency(listing.price)}</p>
                <div className="cm-product-card__meta">
                  <span className={conditionBadgeClass(listing.condition)}>{listing.condition}</span>
                  <span style={{ color: '#888', fontSize: '.82rem' }}>{listing.seller?.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loadingFeatured && featured.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link to="/browse" className="cm-btn cm-btn--secondary">View All Listings</Link>
          </div>
        )}
      </section>
    </>
  )
}

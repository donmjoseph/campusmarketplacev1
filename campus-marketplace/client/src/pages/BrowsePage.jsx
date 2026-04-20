import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import http from '../api/http'
import EmptyState from '../components/common/EmptyState'
import { currency, conditionBadgeClass } from '../utils/format'
import { usePageTitle } from '../utils/usePageTitle'
import { getErrorMessage } from '../utils/errors'
import { useToast } from '../context/ToastContext'

const defaultFilters = {
  q: '',
  category: '',
  condition: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
}

export default function BrowsePage() {
  usePageTitle('Browse Listings')
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()

  const [filters, setFilters] = useState({
    ...defaultFilters,
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
  })
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    return params.toString()
  }, [filters])

  useEffect(() => {
    setSearchParams(queryString)
    async function fetchListings() {
      try {
        setLoading(true)
        const { data } = await http.get(`/listings?${queryString}`)
        setListings(data.listings || [])
      } catch (error) {
        showToast(getErrorMessage(error, 'Failed to load listings.'), 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [queryString, setSearchParams, showToast])

  return (
    <div className="cm-container">
      <div className="cm-page-header">
        <h1 className="cm-page-header__title">Browse Listings</h1>
        <p className="cm-page-header__sub">Search and filter live marketplace items.</p>
      </div>

      <div className="cm-browse-layout">
        <aside className="cm-filters">
          <h3 className="cm-filters__title">Filters</h3>
          <div className="cm-filter-group">
            <label className="cm-filter-group__label">Keyword</label>
            <input value={filters.q} onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))} />
          </div>
          <div className="cm-filter-group">
            <label className="cm-filter-group__label">Category</label>
            <select value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}>
              <option value="">All</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="cm-filter-group">
            <label className="cm-filter-group__label">Condition</label>
            <select value={filters.condition} onChange={(event) => setFilters((prev) => ({ ...prev, condition: event.target.value }))}>
              <option value="">All</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>
          <div className="cm-filter-group">
            <label className="cm-filter-group__label">Min Price</label>
            <input type="number" value={filters.minPrice} onChange={(event) => setFilters((prev) => ({ ...prev, minPrice: event.target.value }))} />
          </div>
          <div className="cm-filter-group">
            <label className="cm-filter-group__label">Max Price</label>
            <input type="number" value={filters.maxPrice} onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))} />
          </div>
          <div className="cm-filter-group">
            <label className="cm-filter-group__label">Sort</label>
            <select value={filters.sort} onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <button type="button" className="cm-btn cm-btn--ghost cm-btn--full" onClick={() => setFilters(defaultFilters)}>
            Clear Filters
          </button>
        </aside>

        <section>
          {loading && <p className="cm-text-muted">Loading listings...</p>}
          {!loading && listings.length === 0 && (
            <EmptyState title="No Listings Found" message="Try changing search filters." />
          )}

          <div className="cm-products-grid">
            {listings.map((listing) => (
              <Link to={`/product/${listing._id}`} key={listing._id} className="cm-product-card">
                <div className="cm-product-card__img">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
                  ) : '📦'}
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
        </section>
      </div>
    </div>
  )
}

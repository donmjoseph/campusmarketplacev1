import { useEffect, useState } from 'react'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { currency, friendlyDate, statusBadgeClass, titleCase } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { usePageTitle } from '../../utils/usePageTitle'

export default function AdminListingsPage() {
  usePageTitle('Manage Listings')
  const { showToast } = useToast()
  const [listings, setListings] = useState([])
  const [filters, setFilters] = useState({ q: '', category: '', status: '' })
  const [loading, setLoading] = useState(true)

  const loadListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
      const { data } = await http.get(`/admin/listings?${params.toString()}`)
      setListings(data.listings || [])
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load listings.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.category, filters.status])

  const moderateListing = async (listingId, action) => {
    let reason = ''
    if (action === 'remove') {
      reason = window.prompt('Enter reason for removing listing:') || ''
      if (!reason) return
    }

    try {
      await http.patch(`/admin/listings/${listingId}/moderate`, { action, reason })
      showToast(`Listing ${action}d.`, action === 'remove' ? 'warning' : 'success')
      await loadListings()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to update listing status.'), 'error')
    }
  }

  return (
    <div className="cm-dash-section">
      <div className="cm-dash-section__head">
        <h2 className="cm-dash-section__title">Manage Listings</h2>
      </div>

      <div className="cm-dash-section__body">
        <div className="cm-form__row cm-mb-20">
          <div className="cm-form__group">
            <label className="cm-form__label">Search</label>
            <input className="cm-form__input" value={filters.q} onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))} />
          </div>
          <div className="cm-form__group">
            <label className="cm-form__label">Category</label>
            <select className="cm-form__select" value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}>
              <option value="">All</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="cm-form__group">
            <label className="cm-form__label">Status</label>
            <select className="cm-form__select" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
              <option value="sold">Sold</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="cm-text-muted">Loading listings...</p>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Seller</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 && (
                  <tr><td colSpan={7} className="cm-table__empty">No listings found.</td></tr>
                )}
                {listings.map((listing) => (
                  <tr key={listing._id}>
                    <td>{listing.title}</td>
                    <td>{listing.seller?.name}</td>
                    <td>{listing.category}</td>
                    <td><span className={statusBadgeClass(listing.status)}>{titleCase(listing.status)}</span></td>
                    <td>{currency(listing.price)}</td>
                    <td>{friendlyDate(listing.createdAt)}</td>
                    <td>
                      {listing.status === 'removed' ? (
                        <button className="cm-btn cm-btn--success cm-btn--sm" type="button" onClick={() => moderateListing(listing._id, 'restore')}>
                          Restore
                        </button>
                      ) : (
                        <button className="cm-btn cm-btn--danger cm-btn--sm" type="button" onClick={() => moderateListing(listing._id, 'remove')}>
                          Remove
                        </button>
                      )}
                    </td>
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

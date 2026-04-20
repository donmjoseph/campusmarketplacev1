import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { usePageTitle } from '../../utils/usePageTitle'

const initialForm = {
  title: '',
  description: '',
  category: 'Books',
  condition: 'Good',
  price: '',
  courseTag: '',
  image: '',
  status: 'active',
}

export default function SellerListingFormPage() {
  const { id } = useParams()
  usePageTitle(id ? 'Edit Listing' : 'Create Listing')
  const navigate = useNavigate()
  const editing = Boolean(id)
  const { showToast } = useToast()

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(editing)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadListing() {
      if (!editing) return

      try {
        setLoading(true)
        const { data } = await http.get(`/listings/${id}`)
        const listing = data.listing
        setForm({
          title: listing.title,
          description: listing.description,
          category: listing.category,
          condition: listing.condition,
          price: String(listing.price),
          courseTag: listing.courseTag || '',
          image: listing.images?.[0] || '',
          status: listing.status,
        })
      } catch (error) {
        showToast(getErrorMessage(error, 'Unable to load listing.'), 'error')
        navigate('/seller/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadListing()
  }, [editing, id, navigate, showToast])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const saveListing = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      condition: form.condition,
      price: Number(form.price),
      courseTag: form.courseTag,
      status: form.status,
      images: form.image ? [form.image] : [],
    }

    try {
      if (editing) {
        await http.patch(`/listings/${id}`, payload)
        showToast('Listing updated.', 'success')
      } else {
        await http.post('/listings', payload)
        showToast('Listing created.', 'success')
      }

      navigate('/seller/dashboard')
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to save listing.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="cm-text-muted">Loading listing...</p>
  }

  return (
    <div className="cm-dash-section">
      <div className="cm-dash-section__head">
        <h2 className="cm-dash-section__title">{editing ? 'Edit Listing' : 'Create Listing'}</h2>
      </div>

      <div className="cm-dash-section__body">
        <form className="cm-form-panel" onSubmit={saveListing}>
          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="listing-title">Title</label>
            <input id="listing-title" className="cm-form__input" value={form.title} onChange={(event) => updateField('title', event.target.value)} required />
          </div>

          <div className="cm-form__row">
            <div className="cm-form__group">
              <label className="cm-form__label" htmlFor="listing-category">Category</label>
              <select id="listing-category" className="cm-form__select" value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="cm-form__group">
              <label className="cm-form__label" htmlFor="listing-condition">Condition</label>
              <select id="listing-condition" className="cm-form__select" value={form.condition} onChange={(event) => updateField('condition', event.target.value)}>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="cm-form__row">
            <div className="cm-form__group">
              <label className="cm-form__label" htmlFor="listing-price">Price</label>
              <input id="listing-price" className="cm-form__input" type="number" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} required />
            </div>
            <div className="cm-form__group">
              <label className="cm-form__label" htmlFor="listing-course">Course Tag</label>
              <input id="listing-course" className="cm-form__input" value={form.courseTag} onChange={(event) => updateField('courseTag', event.target.value)} />
            </div>
          </div>

          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="listing-image">Image URL</label>
            <input id="listing-image" className="cm-form__input" value={form.image} onChange={(event) => updateField('image', event.target.value)} />
          </div>

          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="listing-description">Description</label>
            <textarea id="listing-description" className="cm-form__textarea" value={form.description} onChange={(event) => updateField('description', event.target.value)} required />
          </div>

          <div className="cm-form__group">
            <label className="cm-form__label" htmlFor="listing-status">Status</label>
            <select id="listing-status" className="cm-form__select" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="cm-form__actions">
            <button className="cm-btn cm-btn--primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Publish Listing'}
            </button>
            <button className="cm-btn cm-btn--ghost" type="button" onClick={() => navigate('/seller/dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

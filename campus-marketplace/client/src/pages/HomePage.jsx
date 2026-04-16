import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <>
      <section className="cm-hero">
        <div className="cm-container cm-hero__content">
          <span className="cm-hero__eyebrow">WSU Student Marketplace</span>
          <h1 className="cm-hero__title">Buy, Sell, and Trade on Campus</h1>
          <p className="cm-hero__sub">
            A full MERN-powered local marketplace for WSU students with buyer, seller, and admin workflows.
          </p>
          <div className="cm-hero__actions">
            <Link to="/browse" className="cm-btn cm-btn--primary cm-btn--lg">Browse Listings</Link>
            <Link to="/register" className="cm-btn cm-btn--secondary cm-btn--lg">Create Account</Link>
          </div>
        </div>
      </section>

      <section className="cm-container cm-mt-40">
        <div className="cm-section-head">
          <h2 className="cm-section-head__title">Role-Based Platform</h2>
          <div className="cm-section-head__bar" />
          <p className="cm-section-head__sub">
            Buyers manage carts and orders, sellers manage listings and fulfillment, and admins moderate everything.
          </p>
        </div>

        <div className="cm-stats-grid">
          <div className="cm-stat">
            <div className="cm-stat__val">Buyer</div>
            <div className="cm-stat__label">Browse, Cart, Checkout, Messaging</div>
          </div>
          <div className="cm-stat cm-stat--green">
            <div className="cm-stat__val">Seller</div>
            <div className="cm-stat__label">Listings, Orders, Fulfillment</div>
          </div>
          <div className="cm-stat cm-stat--blue">
            <div className="cm-stat__val">Admin</div>
            <div className="cm-stat__label">Users, Reports, Analytics</div>
          </div>
        </div>
      </section>
    </>
  )
}

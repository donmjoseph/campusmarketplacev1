import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PublicChrome() {
  const { user, logout, cartCount, unreadMessageCount } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const onLogout = () => {
    logout()
    closeMenu()
    navigate('/login')
  }

  const isAdmin  = user?.role === 'admin'
  const isSeller = user?.role === 'seller'
  const isBuyer  = user?.role === 'buyer'

  return (
    <div className="cm-site">
      <div className="cm-wsu-bar">
        <div className="cm-wsu-bar__inner">
          <span className="cm-wsu-bar__wordmark">Washington State University</span>
          <div className="cm-wsu-bar__links">
            <a href="https://wsu.edu" target="_blank" rel="noreferrer">WSU Home</a>
            <a href="https://my.wsu.edu" target="_blank" rel="noreferrer">myWSU</a>
          </div>
        </div>
      </div>

      <header className="cm-header">
        <div className="cm-header__inner">
          <Link className="cm-header__brand" to="/" onClick={closeMenu}>
            <img src="/assets/wsu-badge.jpg" alt="WSU" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            <span className="cm-header__site-name">Campus <span>Marketplace</span></span>
          </Link>

          <button
            type="button"
            className="cm-nav-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <nav className={`cm-nav${menuOpen ? ' cm-nav--open' : ''}`}>
            {!isAdmin && (
              <NavLink className="cm-nav__link" to="/browse" onClick={closeMenu}>
                {isSeller ? 'Marketplace' : 'Browse'}
              </NavLink>
            )}

            {isBuyer && (
              <NavLink className="cm-nav__link" to="/orders" onClick={closeMenu}>Orders</NavLink>
            )}

            {(isBuyer || isSeller) && (
              <NavLink
                className="cm-nav__link"
                to="/messages"
                style={{ position: 'relative' }}
                onClick={closeMenu}
              >
                Messages
                {unreadMessageCount > 0 && (
                  <span className="cm-msg-badge">{unreadMessageCount}</span>
                )}
              </NavLink>
            )}

            {isBuyer && (
              <NavLink className="cm-nav__link" to="/profile" onClick={closeMenu}>Profile</NavLink>
            )}

            {isSeller && (
              <NavLink className="cm-nav__link" to="/seller/dashboard" onClick={closeMenu}>Seller</NavLink>
            )}

            {isAdmin && (
              <NavLink className="cm-nav__link" to="/admin/dashboard" onClick={closeMenu}>Admin</NavLink>
            )}

            {!user && (
              <NavLink className="cm-nav__link" to="/login" onClick={closeMenu}>Login</NavLink>
            )}
            {!user && (
              <NavLink className="cm-nav__link" to="/register" onClick={closeMenu}>Register</NavLink>
            )}

            {user && (
              <button type="button" className="cm-btn cm-btn--ghost cm-btn--sm" onClick={onLogout}>
                Logout
              </button>
            )}

            {!isAdmin && (
              <NavLink className="cm-cart-btn" to="/cart" onClick={closeMenu}>
                Cart
                <span className="cm-cart-badge" style={{ display: cartCount ? 'flex' : 'none' }}>
                  {cartCount}
                </span>
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="cm-main">
        <Outlet />
      </main>

      <footer className="cm-footer">
        <div className="cm-container">
          <div className="cm-footer__grid">
            <div>
              <div className="cm-footer__brand-name">Campus Marketplace</div>
              <p className="cm-footer__desc">Built for WSU students to buy, sell, and connect safely on campus.</p>
            </div>
            <div>
              <h4 className="cm-footer__col-title">Marketplace</h4>
              <ul className="cm-footer__links">
                <li><Link to="/browse">Browse Listings</Link></li>
                <li><Link to="/cart">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="cm-footer__col-title">Account</h4>
              <ul className="cm-footer__links">
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/orders">Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="cm-footer__col-title">Support</h4>
              <ul className="cm-footer__links">
                <li><a href="mailto:support@wsu.edu">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="cm-footer__bottom">
            <span>© {new Date().getFullYear()} WSU Campus Marketplace</span>
            <span className="cm-footer__wsu">
              <span className="cm-footer__wsu-pill">WSU</span> Built with MERN
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

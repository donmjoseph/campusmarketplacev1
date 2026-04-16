import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PublicChrome() {
  const { user, logout, cartCount } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

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
          <Link className="cm-header__brand" to="/">
            <span className="cm-header__pill">WSU</span>
            <span className="cm-header__site-name">Campus <span>Marketplace</span></span>
          </Link>

          <nav className="cm-nav">
            <NavLink className="cm-nav__link" to="/browse">Browse</NavLink>
            {user?.role === 'buyer' && <NavLink className="cm-nav__link" to="/orders">Orders</NavLink>}
            {user?.role === 'buyer' && <NavLink className="cm-nav__link" to="/messages">Messages</NavLink>}
            {user?.role === 'buyer' && <NavLink className="cm-nav__link" to="/profile">Profile</NavLink>}
            {user?.role === 'seller' && <NavLink className="cm-nav__link" to="/seller/dashboard">Seller</NavLink>}
            {user?.role === 'admin' && <NavLink className="cm-nav__link" to="/admin/dashboard">Admin</NavLink>}
            {!user && <NavLink className="cm-nav__link" to="/login">Login</NavLink>}
            {!user && <NavLink className="cm-nav__link" to="/register">Register</NavLink>}
            {user && (
              <button type="button" className="cm-btn cm-btn--ghost cm-btn--sm" onClick={onLogout}>
                Logout
              </button>
            )}
            <NavLink className="cm-cart-btn" to="/cart">
              Cart
              <span className="cm-cart-badge" style={{ display: cartCount ? 'flex' : 'none' }}>{cartCount}</span>
            </NavLink>
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
            <span className="cm-footer__wsu"><span className="cm-footer__wsu-pill">WSU</span> Built with MERN</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

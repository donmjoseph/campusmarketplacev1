import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout({ mode = 'seller' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const sellerLinks = [
    { to: '/seller/dashboard', label: 'Dashboard' },
    { to: '/seller/listings/new', label: 'Create Listing' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/listings', label: 'Listings' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to: '/admin/reports', label: 'Reports' },
  ]

  const links = mode === 'admin' ? adminLinks : sellerLinks

  return (
    <div className="cm-dash-layout">
      <aside className="cm-sidebar">
        <div className="cm-sidebar__brand">
          <div className="cm-sidebar__brand-name">Campus Marketplace</div>
          <div className="cm-sidebar__brand-role">{mode === 'admin' ? 'Admin Portal' : 'Seller Portal'}</div>
        </div>
        <div className="cm-sidebar__section">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `cm-sidebar__link ${isActive ? 'cm-sidebar__link--active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/browse" className="cm-sidebar__link">Marketplace</NavLink>
          <button
            type="button"
            className="cm-sidebar__link"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="cm-dash-main">
        <div className="cm-mb-20">
          <h1 className="cm-page-header__title">Welcome, {user?.name}</h1>
          <p className="cm-page-header__sub">Role: {user?.role}</p>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

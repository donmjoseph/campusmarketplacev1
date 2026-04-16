import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicChrome from './components/layout/PublicChrome'
import DashboardLayout from './components/layout/DashboardLayout'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BrowsePage from './pages/BrowsePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import NotFoundPage from './pages/NotFoundPage'

import SellerDashboardPage from './pages/seller/SellerDashboardPage'
import SellerListingFormPage from './pages/seller/SellerListingFormPage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminListingsPage from './pages/admin/AdminListingsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicChrome />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={(
                  <ProtectedRoute allowRoles={['buyer']}>
                    <CheckoutPage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/order-confirmation"
                element={(
                  <ProtectedRoute allowRoles={['buyer']}>
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/orders"
                element={(
                  <ProtectedRoute allowRoles={['buyer']}>
                    <OrdersPage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/profile"
                element={(
                  <ProtectedRoute allowRoles={['buyer', 'seller', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/messages"
                element={(
                  <ProtectedRoute allowRoles={['buyer', 'seller']}>
                    <MessagesPage />
                  </ProtectedRoute>
                )}
              />
            </Route>

            <Route
              path="/seller"
              element={(
                <ProtectedRoute allowRoles={['seller']}>
                  <DashboardLayout mode="seller" />
                </ProtectedRoute>
              )}
            >
              <Route path="dashboard" element={<SellerDashboardPage />} />
              <Route path="listings/new" element={<SellerListingFormPage />} />
              <Route path="listings/:id/edit" element={<SellerListingFormPage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            <Route
              path="/admin"
              element={(
                <ProtectedRoute allowRoles={['admin']}>
                  <DashboardLayout mode="admin" />
                </ProtectedRoute>
              )}
            >
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="listings" element={<AdminListingsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App

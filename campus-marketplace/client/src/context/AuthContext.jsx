import { createContext, useContext, useEffect, useRef, useState } from 'react'
import http, { setAuthToken } from '../api/http'

const AuthContext = createContext(null)
const TOKEN_KEY = 'cm_auth_token'
const UNREAD_POLL_MS = 30_000

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const pollRef = useRef(null)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  async function refreshUnreadCount() {
    try {
      const { data } = await http.get('/messages/unread-count')
      setUnreadMessageCount(data.count || 0)
    } catch {
      // silently fail — non-critical
    }
  }

  useEffect(() => {
    const canReceiveMessages = user?.role === 'buyer' || user?.role === 'seller'
    if (!canReceiveMessages) {
      setUnreadMessageCount(0)
      clearInterval(pollRef.current)
      return
    }
    refreshUnreadCount()
    pollRef.current = setInterval(refreshUnreadCount, UNREAD_POLL_MS)
    return () => clearInterval(pollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function refreshCartCount(currentUser = user) {
    if (!currentUser || currentUser.role !== 'buyer') {
      setCartCount(0)
      return
    }

    try {
      const { data } = await http.get('/cart')
      setCartCount(data.items?.length || 0)
    } catch {
      setCartCount(0)
    }
  }

  async function bootstrap() {
    if (!token) {
      setBooting(false)
      return
    }

    try {
      const { data } = await http.get('/auth/me')
      setUser(data.user)
      await refreshCartCount(data.user)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setAuthToken('')
      setToken('')
      setUser(null)
      setCartCount(0)
    } finally {
      setBooting(false)
    }
  }

  useEffect(() => {
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(credentials) {
    const { data } = await http.post('/auth/login', credentials)
    localStorage.setItem(TOKEN_KEY, data.token)
    setAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    await refreshCartCount(data.user)
    return data.user
  }

  async function register(payload) {
    const { data } = await http.post('/auth/register', payload)
    localStorage.setItem(TOKEN_KEY, data.token)
    setAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    await refreshCartCount(data.user)
    return data.user
  }

  async function refreshUser() {
    const { data } = await http.get('/auth/me')
    setUser(data.user)
    await refreshCartCount(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setAuthToken('')
    setToken('')
    setUser(null)
    setCartCount(0)
    setUnreadMessageCount(0)
    clearInterval(pollRef.current)
  }

  const value = {
    token,
    user,
    booting,
    cartCount,
    setCartCount,
    unreadMessageCount,
    refreshUnreadCount,
    login,
    register,
    refreshUser,
    refreshCartCount,
    logout,
    isAuthenticated: Boolean(user && token),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

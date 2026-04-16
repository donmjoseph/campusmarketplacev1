import { createContext, useContext, useEffect, useState } from 'react'
import http, { setAuthToken } from '../api/http'

const AuthContext = createContext(null)
const TOKEN_KEY = 'cm_auth_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

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
  }

  const value = {
    token,
    user,
    booting,
    cartCount,
    setCartCount,
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

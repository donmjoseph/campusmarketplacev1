import axios from 'axios'

function resolveBaseURL() {
  const configured = import.meta.env.VITE_API_URL?.trim()

  if (!configured) {
    return '/api'
  }

  const withoutTrailingSlash = configured.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`
}

const baseURL = resolveBaseURL()

const http = axios.create({
  baseURL,
  timeout: 15000,
})

export function setAuthToken(token) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete http.defaults.headers.common.Authorization
  }
}

export default http

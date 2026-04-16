import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

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

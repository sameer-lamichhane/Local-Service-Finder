import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (error.response?.status !== 400) {
      toast.error(message)
    }
    return Promise.reject(error)
  }
)

export default api

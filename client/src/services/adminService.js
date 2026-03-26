import api from './api'

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getUserDetail: (id) => api.get(`/admin/users/${id}`),
  suspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
  verifyWorker: (id) => api.put(`/admin/workers/${id}/verify`),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
}

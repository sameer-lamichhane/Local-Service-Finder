import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { LayoutDashboard, CalendarCheck, User, Briefcase, ListChecks, Users, Settings } from 'lucide-react'
import { useAuthStore } from './store/authStore'
import { socket } from './services/socket'
import { notify } from './utils/notify'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Client pages
import ClientDashboard from './pages/client/ClientDashboard'
import MyBookings from './pages/client/MyBookings'
import ClientProfile from './pages/client/ClientProfile'

// Worker pages
import WorkerDashboard from './pages/worker/WorkerDashboard'
import MyServices from './pages/worker/MyServices'
import WorkerRequests from './pages/worker/WorkerRequests'
import WorkerProfile from './pages/worker/WorkerProfile'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminServices from './pages/admin/AdminServices'
import AdminBookings from './pages/admin/AdminBookings'

const clientLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'My Bookings', icon: CalendarCheck },
  { to: '/profile', label: 'Profile', icon: User },
]

const workerLinks = [
  { to: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/worker/services', label: 'My Services', icon: Briefcase },
  { to: '/worker/requests', label: 'Requests', icon: ListChecks },
  { to: '/worker/profile', label: 'Profile', icon: User },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/services', label: 'Services', icon: Briefcase },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
]

export default function App() {
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const uid = user?._id || user?.id
    if (isAuthenticated && uid) {
      const onConnect = () => socket.emit('join', uid)

      const onNewBooking = ({ message }) => {
        notify(message, '📋')
      }
      const onBookingStatus = ({ message, status }) => {
        const icon = status === 'accepted' ? '✅' : status === 'rejected' ? '❌' : '🏁'
        notify(message, icon)
      }

      socket.on('connect', onConnect)
      socket.on('new_booking', onNewBooking)
      socket.on('booking_status', onBookingStatus)

      socket.connect()
      if (socket.connected) socket.emit('join', uid)

      return () => {
        socket.off('connect', onConnect)
        socket.off('new_booking', onNewBooking)
        socket.off('booking_status', onBookingStatus)
      }
    } else {
      socket.disconnect()
    }
  }, [isAuthenticated, user?._id, user?.id])

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center text-center px-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
              <p className="text-gray-500">You don't have permission to access this page.</p>
            </div>
          </div>
        } />
      </Route>

      {/* Client routes */}
      <Route element={<ProtectedRoute roles={['client']} />}>
        <Route element={<DashboardLayout links={clientLinks} title="Client Dashboard" />}>
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/profile" element={<ClientProfile />} />
        </Route>
      </Route>

      {/* Worker routes */}
      <Route element={<ProtectedRoute roles={['worker']} />}>
        <Route element={<DashboardLayout links={workerLinks} title="Worker Dashboard" />}>
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/services" element={<MyServices />} />
          <Route path="/worker/requests" element={<WorkerRequests />} />
          <Route path="/worker/profile" element={<WorkerProfile />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashboardLayout links={adminLinks} title="Admin Panel" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

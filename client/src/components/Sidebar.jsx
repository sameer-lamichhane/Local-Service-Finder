import { NavLink, Link, useNavigate } from 'react-router-dom'
import { LogOut, X, Wrench, Globe } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Sidebar({ links, isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary-600 hover:opacity-80 transition-opacity">
            <Wrench size={20} />
            LocalServe
          </Link>
          <button className="lg:hidden p-1 hover:bg-gray-100 rounded" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            to="/services"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Globe size={18} />
            View Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

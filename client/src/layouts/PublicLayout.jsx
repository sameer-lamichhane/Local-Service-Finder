import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LocalServe. All rights reserved.
      </footer>
    </div>
  )
}

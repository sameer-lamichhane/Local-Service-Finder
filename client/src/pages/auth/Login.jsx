import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/Input'
import Button from '../../components/Button'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await authService.login(form)
      setAuth(data.data.user, data.data.token)
      toast.success('Welcome back!')
      const role = data.data.user.role
      if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'worker') navigate('/worker/dashboard')
      else navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl mb-2">
            <Wrench size={28} /> LocalServe
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email} />
            <Input label="Password" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password} />
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench, User, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/Input'
import Button from '../../components/Button'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client', location: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await authService.register(form)
      setAuth(data.data.user, data.data.token)
      toast.success('Account created!')
      const role = data.data.user.role
      navigate(role === 'worker' ? '/worker/dashboard' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl mb-2">
            <Wrench size={28} /> LocalServe
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 mt-1">Join thousands of service providers and clients</p>
        </div>

        <div className="card p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'client', label: 'I need services', icon: User },
              { value: 'worker', label: 'I offer services', icon: Briefcase },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, role: value })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.role === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon size={22} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name} />
            <Input label="Email" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email} />
            <Input label="Password" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password} />
            <Input label="Location (optional)" placeholder="City, State"
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

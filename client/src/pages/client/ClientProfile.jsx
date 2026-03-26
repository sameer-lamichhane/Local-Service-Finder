import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/Input'
import Button from '../../components/Button'

export default function ClientProfile() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '', location: user?.location || '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    // In a real app, call a PATCH /api/auth/profile endpoint
    setTimeout(() => {
      updateUser({ ...user, ...form })
      toast.success('Profile updated')
      setSaving(false)
    }, 500)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Location" placeholder="City, State" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Email" value={user?.email} disabled className="bg-gray-50 cursor-not-allowed" />
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </div>
    </div>
  )
}

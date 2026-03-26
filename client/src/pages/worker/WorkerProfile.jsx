import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, Clock } from 'lucide-react'
import { workerService } from '../../services/workerService'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/Input'
import Button from '../../components/Button'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function WorkerProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ bio: '', experience: '', hourlyRate: '', location: '', skills: '' })

  useEffect(() => {
    workerService.getProfile()
      .then(({ data }) => {
        const p = data.data
        setProfile(p)
        setForm({
          bio: p.bio || '',
          experience: p.experience || '',
          hourlyRate: p.hourlyRate || '',
          location: p.location || '',
          skills: (p.skills || []).join(', '),
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }
      await workerService.updateProfile(payload)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Worker Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.isVerified
              ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={12} /> Verified</span>
              : <span className="flex items-center gap-1 text-xs text-yellow-600"><Clock size={12} /> Pending verification</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Tell clients about yourself..."
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <Input label="Experience" placeholder="e.g. 5 years in plumbing"
            value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          <Input label="Hourly Rate ($)" type="number" min="0"
            value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
          <Input label="Location" placeholder="City, State"
            value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input className="input-field" placeholder="e.g. Plumbing, Pipe fitting, Leak repair"
              value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          </div>
          <Button type="submit" loading={saving}>Save Profile</Button>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { serviceService } from '../../services/serviceService'
import { formatCurrency, CATEGORIES } from '../../utils/helpers'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm = { title: '', category: '', description: '', price: '', location: '' }

export default function MyServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchServices = () => {
    serviceService.getAll()
      .then(({ data }) => setServices(data.data.services))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchServices() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (s) => {
    setEditing(s._id)
    setForm({ title: s.title, category: s.category, description: s.description, price: s.price, location: s.location || '' })
    setModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await serviceService.update(editing, form)
        toast.success('Service updated')
      } else {
        await serviceService.create(form)
        toast.success('Service created')
      }
      setModal(false)
      fetchServices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    try {
      await serviceService.delete(id)
      toast.success('Service deleted')
      fetchServices()
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <Button onClick={openCreate} size="sm"><Plus size={16} /> Add Service</Button>
      </div>

      {services.length === 0 ? (
        <EmptyState title="No services yet" description="Create your first service to start getting bookings." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s._id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{s.category}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{s.description}</p>
              <p className="font-bold text-primary-600">{formatCurrency(s.price)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Service' : 'New Service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <Input label="Price ($)" type="number" min="0" step="0.01" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input label="Location" placeholder="City, State" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

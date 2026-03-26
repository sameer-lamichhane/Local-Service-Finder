import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { CalendarCheck, Clock, MapPin, Phone, FileText, AlertCircle, User, Wrench } from 'lucide-react'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    adminService.getBookings(statusFilter ? { status: statusFilter } : {})
      .then(({ data }) => setBookings(data.data.bookings))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        <select className="input-field w-auto text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'accepted', 'rejected', 'completed', 'cancelled'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner className="py-20" /> : bookings.length === 0 ? (
        <EmptyState title="No bookings found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Service', 'Client', 'Worker', 'Date', 'Price', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b._id} onClick={() => setSelected(b)}
                    className="hover:bg-primary-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{b.serviceId?.title}</td>
                    <td className="px-4 py-3 text-gray-500">{b.clientId?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{b.workerId?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(b.date)}</td>
                    <td className="px-4 py-3 text-primary-600 font-medium">
                      {b.serviceId?.price ? formatCurrency(b.serviceId.price) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Booking Details">
        {selected && (
          <div className="space-y-4">
            {/* Service */}
            <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-xl">
              <Wrench size={16} className="text-primary-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Service</p>
                <p className="font-semibold text-gray-900">{selected.serviceId?.title}</p>
                <p className="text-xs text-gray-500">{selected.serviceId?.category} · {selected.serviceId?.price ? formatCurrency(selected.serviceId.price) : '—'}</p>
              </div>
            </div>

            {/* Client & Worker */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><User size={11} /> Client</p>
                <p className="font-medium text-gray-900 text-sm">{selected.clientId?.name}</p>
                <p className="text-xs text-gray-500">{selected.clientId?.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><User size={11} /> Worker</p>
                <p className="font-medium text-gray-900 text-sm">{selected.workerId?.name}</p>
                <p className="text-xs text-gray-500">{selected.workerId?.email}</p>
              </div>
            </div>

            {/* Date / Time / Phone / Address */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <CalendarCheck size={14} className="mt-0.5 text-primary-500 shrink-0" />
                <div><p className="text-xs text-gray-400">Date</p><p>{formatDate(selected.date)}</p></div>
              </div>
              {selected.scheduledTime && (
                <div className="flex items-start gap-2 text-gray-600">
                  <Clock size={14} className="mt-0.5 text-primary-500 shrink-0" />
                  <div><p className="text-xs text-gray-400">Time</p><p>{selected.scheduledTime}</p></div>
                </div>
              )}
              {selected.phone && (
                <div className="flex items-start gap-2 text-gray-600">
                  <Phone size={14} className="mt-0.5 text-primary-500 shrink-0" />
                  <div><p className="text-xs text-gray-400">Phone</p><p>{selected.phone}</p></div>
                </div>
              )}
              {selected.address && (
                <div className="flex items-start gap-2 text-gray-600 col-span-2">
                  <MapPin size={14} className="mt-0.5 text-primary-500 shrink-0" />
                  <div><p className="text-xs text-gray-400">Address</p><p>{selected.address}</p></div>
                </div>
              )}
            </div>

            {/* Issue */}
            {selected.notes && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mb-1.5">
                  <AlertCircle size={13} /> Issue Reported
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{selected.notes.split('\n\n')[0]}</p>
              </div>
            )}
            {selected.notes?.includes('\n\n') && (
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                <div className="flex items-center gap-1.5 text-yellow-600 text-xs font-semibold mb-1.5">
                  <FileText size={13} /> Additional Notes
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{selected.notes.split('\n\n').slice(1).join('\n\n')}</p>
              </div>
            )}

            <div className="pt-1">
              <Badge className={getStatusColor(selected.status)}>{selected.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

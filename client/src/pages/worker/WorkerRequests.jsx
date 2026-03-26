import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { bookingService } from '../../services/bookingService'
import { socket } from '../../services/socket'
import { formatDate, getStatusColor } from '../../utils/helpers'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarCheck, Phone, MapPin, Clock, FileText, AlertCircle } from 'lucide-react'

export default function WorkerRequests() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [selected, setSelected] = useState(null)

  const fetchBookings = useCallback(() => {
    bookingService.getAll()
      .then(({ data }) => setBookings(data.data.bookings))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchBookings()

    const onNew = ({ booking }) => {
      if (booking) {
        setBookings((prev) => [booking, ...prev])
      } else {
        fetchBookings()
      }
    }

    socket.on('new_booking', onNew)
    return () => socket.off('new_booking', onNew)
  }, [fetchBookings])

  const handleStatus = async (id, status) => {
    setUpdating(id + status)
    try {
      await bookingService.updateStatus(id, status)
      toast.success(`Booking ${status}`)
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b))
      setSelected((prev) => prev?._id === id ? { ...prev, status } : prev)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Incoming Requests</h1>
      {bookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No requests yet" description="Requests will appear here when clients book your services." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b._id}
              onClick={() => setSelected(b)}
              className="card p-5 cursor-pointer hover:shadow-md hover:border-primary-200 border border-transparent transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {b.clientId?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{b.serviceId?.title}</p>
                    <p className="text-xs text-gray-500">{b.clientId?.name} · {formatDate(b.date)}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Booking Details">
        {selected && (
          <div className="space-y-4">

            {/* Client info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
                {selected.clientId?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{selected.clientId?.name}</p>
                <p className="text-xs text-gray-500">{selected.clientId?.email}</p>
              </div>
            </div>

            {/* Date / Time / Address */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <CalendarCheck size={15} className="mt-0.5 text-primary-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p>{formatDate(selected.date)}</p>
                </div>
              </div>
              {selected.scheduledTime && (
                <div className="flex items-start gap-2 text-gray-600">
                  <Clock size={15} className="mt-0.5 text-primary-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Time</p>
                    <p>{selected.scheduledTime}</p>
                  </div>
                </div>
              )}
              {selected.address && (
                <div className="flex items-start gap-2 text-gray-600 col-span-2">
                  <MapPin size={15} className="mt-0.5 text-primary-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p>{selected.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Issue card */}
            {selected.notes && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mb-1.5">
                  <AlertCircle size={13} /> Issue Reported
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {selected.notes.split('\n\n')[0]}
                </p>
              </div>
            )}

            {/* Notes card (additional notes, second part) */}
            {selected.notes?.includes('\n\n') && (
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                <div className="flex items-center gap-1.5 text-yellow-600 text-xs font-semibold mb-1.5">
                  <FileText size={13} /> Additional Notes
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {selected.notes.split('\n\n').slice(1).join('\n\n')}
                </p>
              </div>
            )}

            {/* Actions row: call + accept/reject */}
            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selected.status)}>{selected.status}</Badge>
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone size={14} /> Call
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                {selected.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => handleStatus(selected._id, 'accepted')}
                      loading={updating === selected._id + 'accepted'}>Accept</Button>
                    <Button size="sm" variant="danger" onClick={() => handleStatus(selected._id, 'rejected')}
                      loading={updating === selected._id + 'rejected'}>Reject</Button>
                  </>
                )}
                {selected.status === 'accepted' && (
                  <Button size="sm" variant="secondary" onClick={() => handleStatus(selected._id, 'completed')}
                    loading={updating === selected._id + 'completed'}>Mark Complete</Button>
                )}
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  )
}

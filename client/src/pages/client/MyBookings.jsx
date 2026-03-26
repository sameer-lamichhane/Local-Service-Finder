import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { bookingService } from '../../services/bookingService'
import { socket } from '../../services/socket'
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarCheck, Phone, MapPin, Clock, FileText } from 'lucide-react'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  const fetchBookings = useCallback(() => {
    bookingService.getAll()
      .then(({ data }) => setBookings(data.data.bookings))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchBookings()

    const onStatus = ({ bookingId, status }) => {
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status } : b))
    }
    socket.on('booking_status', onStatus)
    return () => socket.off('booking_status', onStatus)
  }, [fetchBookings])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      await bookingService.cancel(id)
      toast.success('Booking cancelled')
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No bookings yet" description="Browse services and make your first booking." />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{b.serviceId?.title}</h3>
                    <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                  </div>

                  {/* Worker info with call button */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                      {b.workerId?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600">{b.workerId?.name}</span>
                    {b.phone && (
                      <span className="flex items-center gap-1 ml-1 text-xs text-gray-500">
                        <Phone size={12} /> {b.phone}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><CalendarCheck size={12} />{formatDate(b.date)}</span>
                    {b.scheduledTime && <span className="flex items-center gap-1"><Clock size={12} />{b.scheduledTime}</span>}
                    {b.address && <span className="flex items-center gap-1"><MapPin size={12} />{b.address}</span>}
                  </div>

                  {b.notes && (
                    <p className="text-xs text-gray-400 flex items-start gap-1">
                      <FileText size={12} className="mt-0.5 shrink-0" />
                      <span className="italic">{b.notes}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.serviceId?.price && (
                    <span className="font-semibold text-primary-600">{formatCurrency(b.serviceId.price)}</span>
                  )}
                  {['pending', 'accepted'].includes(b.status) && (
                    <Button variant="danger" size="sm" loading={cancelling === b._id} onClick={() => handleCancel(b._id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, DollarSign, Calendar, CheckCircle, Wrench, LocateFixed, Star, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { serviceService } from '../services/serviceService'
import { bookingService } from '../services/bookingService'
import { workerService } from '../services/workerService'
import { useAuthStore } from '../store/authStore'
import { formatCurrency, formatDate } from '../utils/helpers'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { PageLoader } from '../components/LoadingSpinner'

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingModal, setBookingModal] = useState(false)
  const [bookingForm, setBookingForm] = useState({ date: '', scheduledTime: '', address: '', phone: '+977 ', issue: '', notes: '' })
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [booking, setBooking] = useState(false)
  const [workerProfile, setWorkerProfile] = useState(null)
  const [workerModal, setWorkerModal] = useState(false)

  useEffect(() => {
    serviceService.getOne(id)
      .then(({ data }) => setService(data.data))
      .catch(() => navigate('/services'))
      .finally(() => setLoading(false))
  }, [id])

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const fallback = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
        setBookingForm((f) => ({ ...f, address: fallback }))
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'LocalServeApp/1.0' } }
          )
          if (!res.ok) throw new Error('Geocode failed')
          const data = await res.json()
          if (data.display_name) setBookingForm((f) => ({ ...f, address: data.display_name }))
        } catch {
          // fallback coords already set
        } finally {
          setDetectingLocation(false)
        }
      },
      (err) => {
        toast.error(err.code === 1 ? 'Location permission denied' : 'Could not detect location')
        setDetectingLocation(false)
      },
      { timeout: 10000 }
    )
  }

  const openWorkerProfile = async () => {
    if (!service?.workerId?._id) return
    setWorkerModal(true)
    if (!workerProfile) {
      try {
        const { data } = await workerService.getWorkerById(service.workerId._id)
        setWorkerProfile(data.data)
      } catch {
        toast.error('Could not load worker profile')
      }
    }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return navigate('/login')
    setBooking(true)
    try {
      const payload = {
        serviceId: id,
        date: new Date(`${bookingForm.date}T${bookingForm.scheduledTime}`).toISOString(),
        scheduledTime: bookingForm.scheduledTime,
        address: bookingForm.address,
        phone: bookingForm.phone,
        notes: [bookingForm.issue, bookingForm.notes].filter(Boolean).join('\n\n'),
      }
      await bookingService.create(payload)
      toast.success('Booking created successfully!')
      setBookingModal(false)
      navigate('/bookings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <PageLoader />
  if (!service) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="card overflow-hidden">
        <div className="h-56 bg-gradient-to-br from-primary-100 to-primary-300 flex items-center justify-center">
          <Wrench size={72} className="text-primary-400" />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                {service.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{service.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {service.location && (
                  <span className="flex items-center gap-1"><MapPin size={14} />{service.location}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={14} />{formatDate(service.createdAt)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">{formatCurrency(service.price)}</p>
              <p className="text-xs text-gray-400">per service</p>
            </div>
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">{service.description}</p>

          {service.workerId && (
            <div onClick={openWorkerProfile}
              className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-primary-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center text-lg font-bold text-primary-700">
                {service.workerId.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{service.workerId.name}</p>
                <p className="text-sm text-gray-500">{service.workerId.location}</p>
                {service.workerId.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium mt-0.5">
                    <CheckCircle size={12} /> Verified Worker
                  </span>
                )}
              </div>
              <span className="text-xs text-primary-600 font-medium">View Profile →</span>
            </div>
          )}

          {user?.role === 'client' && (
            <div className="mt-8">
              <Button onClick={() => setBookingModal(true)} size="lg" className="w-full sm:w-auto">
                Book This Service
              </Button>
            </div>
          )}
          {!isAuthenticated && (
            <div className="mt-8">
              <Button onClick={() => navigate('/login')} size="lg" className="w-full sm:w-auto">
                Login to Book
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Book Service">
        <form onSubmit={handleBook} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
              <input type="date" className="input-field"
                value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                required min={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time *</label>
              <input type="time" className="input-field"
                value={bookingForm.scheduledTime} onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Address *</label>
            <div className="flex gap-2">
              <input type="text" className="input-field flex-1" placeholder="123 Main St, City"
                value={bookingForm.address} onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                required />
              <button type="button" onClick={detectLocation} disabled={detectingLocation}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 whitespace-nowrap">
                <LocateFixed size={15} className={detectingLocation ? 'animate-spin' : ''} />
                {detectingLocation ? 'Detecting...' : 'Auto'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input type="tel" className="input-field" placeholder="+977 98XXXXXXXX"
              value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Describe the Issue *</label>
            <textarea className="input-field resize-none" rows={3} placeholder="e.g. My kitchen sink is leaking under the cabinet..."
              value={bookingForm.issue} onChange={(e) => setBookingForm({ ...bookingForm, issue: e.target.value })}
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (optional)</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Any other details..."
              value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={booking} className="flex-1">Confirm Booking</Button>
            <Button type="button" variant="secondary" onClick={() => setBookingModal(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Worker Profile Modal */}
      <Modal isOpen={workerModal} onClose={() => setWorkerModal(false)} title="Worker Profile">
        {!workerProfile ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-200 flex items-center justify-center text-2xl font-bold text-primary-700">
                {workerProfile.userId?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{workerProfile.userId?.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {workerProfile.userId?.isVerified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={11} /> Verified
                    </span>
                  )}
                  {workerProfile.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded-full">
                      <Star size={11} /> {workerProfile.rating.toFixed(1)} ({workerProfile.ratingCount})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {workerProfile.userId?.location && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin size={14} className="mt-0.5 text-primary-400 shrink-0" />
                  <div><p className="text-xs text-gray-400">Location</p><p>{workerProfile.userId.location}</p></div>
                </div>
              )}
              {workerProfile.hourlyRate && (
                <div className="flex items-start gap-2 text-gray-600">
                  <DollarSign size={14} className="mt-0.5 text-primary-400 shrink-0" />
                  <div><p className="text-xs text-gray-400">Hourly Rate</p><p>{formatCurrency(workerProfile.hourlyRate)}/hr</p></div>
                </div>
              )}
              {workerProfile.experience && (
                <div className="flex items-start gap-2 text-gray-600 col-span-2">
                  <Briefcase size={14} className="mt-0.5 text-primary-400 shrink-0" />
                  <div><p className="text-xs text-gray-400">Experience</p><p>{workerProfile.experience}</p></div>
                </div>
              )}
            </div>
            {workerProfile.bio && (
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                <p className="text-xs text-gray-400 mb-1">About</p>
                <p className="leading-relaxed">{workerProfile.bio}</p>
              </div>
            )}
            {workerProfile.skills?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {workerProfile.skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

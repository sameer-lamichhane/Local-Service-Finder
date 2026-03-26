import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, Shield, Clock, Star, Sparkles, Wrench, Zap, Hammer, Paintbrush, Leaf, Truck, BookOpen, ChefHat, PawPrint } from 'lucide-react'
import { CATEGORIES } from '../utils/helpers'

const categoryIcons = {
  Cleaning: Sparkles,
  Plumbing: Wrench,
  Electrical: Zap,
  Carpentry: Hammer,
  Painting: Paintbrush,
  Gardening: Leaf,
  Moving: Truck,
  Tutoring: BookOpen,
  Cooking: ChefHat,
  'Pet Care': PawPrint,
}

export default function Home() {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (location) params.set('location', location)
    navigate(`/services?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Find Trusted Local Services
          </h1>

          <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto">
            Connect with skilled professionals in your area for any job, big or small.
          </p>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto shadow-xl">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm py-2"
                placeholder="What service do you need?"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 border-t sm:border-t-0 sm:border-l border-gray-200">
              <MapPin size={18} className="text-gray-400 shrink-0" />
              <input
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm py-2"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat] || Wrench
            return (
              <Link
                key={cat}
                to={`/services?category=${cat}`}
                className="card p-5 text-center hover:shadow-md transition-shadow hover:border-primary-200 group"
              >
                <div className="flex justify-center mb-2">
                  <Icon size={28} className="text-primary-500 group-hover:text-primary-700 transition-colors" />
                </div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-primary-600">{cat}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">Why LocalServe?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Verified Professionals', desc: 'All workers are background-checked and verified by our team.' },
              { icon: Star, title: 'Rated & Reviewed', desc: 'Read real reviews from real customers before you book.' },
              { icon: Clock, title: 'Fast & Reliable', desc: 'Book in minutes and get the job done on your schedule.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4">
                  <Icon size={26} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-50 py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to get started?</h2>
        <p className="text-gray-500 mb-6">Join thousands of clients and workers on LocalServe.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" className="btn-primary px-6 py-3 rounded-xl">Find a Service</Link>
          <Link to="/register" className="btn-secondary px-6 py-3 rounded-xl">Offer Services</Link>
        </div>
      </section>
    </div>
  )
}

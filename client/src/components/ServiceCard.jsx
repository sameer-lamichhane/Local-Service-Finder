import { MapPin, CheckCircle, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/helpers'

export default function ServiceCard({ service }) {
  return (
    <Link to={`/services/${service._id}`} className="card hover:shadow-md transition-shadow duration-200 block">
      <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        <Wrench size={48} className="text-primary-400" />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {service.category}
        </span>
        <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-1">{service.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{service.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin size={14} />
            <span className="truncate max-w-[100px]">{service.location || 'Remote'}</span>
          </div>
          <span className="font-semibold text-primary-600">{formatCurrency(service.price)}</span>
        </div>
        {service.workerId && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-xs font-bold text-primary-700">
              {service.workerId.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-600">{service.workerId.name}</span>
            {service.workerId.isVerified && (
              <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle size={11} /> Verified
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

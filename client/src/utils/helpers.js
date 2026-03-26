export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const CATEGORIES = [
  'Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting',
  'Gardening', 'Moving', 'Tutoring', 'Cooking', 'Pet Care',
]

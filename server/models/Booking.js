const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true },
    scheduledTime: { type: String }, // e.g. "09:00 AM"
    address: { type: String },
    phone: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

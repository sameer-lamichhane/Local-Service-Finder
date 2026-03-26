const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const WorkerProfile = require('../models/WorkerProfile');
const { sendResponse, sendError } = require('../utils/response');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const query = role ? { role } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    sendResponse(res, 200, 'Users fetched', {
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    if (user.role === 'admin') return sendError(res, 400, 'Cannot delete an admin account');

    await user.deleteOne();
    sendResponse(res, 200, 'User deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify/approve a worker
// @route   PUT /api/admin/workers/:id/verify
// @access  Private (admin)
const verifyWorker = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    if (user.role !== 'worker') return sendError(res, 400, 'User is not a worker');

    user.isVerified = true;
    await user.save();

    sendResponse(res, 200, 'Worker verified successfully', { id: user._id, isVerified: user.isVerified });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('clientId', 'name email')
      .populate('workerId', 'name email')
      .populate('serviceId', 'title category price')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    sendResponse(res, 200, 'Bookings fetched', {
      bookings,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service (admin)
// @route   DELETE /api/admin/services/:id
// @access  Private (admin)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return sendError(res, 404, 'Service not found');
    await service.deleteOne();
    sendResponse(res, 200, 'Service deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalWorkers, totalClients, totalServices, totalBookings,
      pendingBookings, completedBookings, cancelledBookings, acceptedBookings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'client' }),
      Service.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ status: 'accepted' }),
    ]);

    // Last 7 days bookings
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = await Booking.countDocuments({ createdAt: { $gte: d, $lt: next } });
      days.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), count });
    }

    sendResponse(res, 200, 'Stats fetched', {
      totalUsers, totalWorkers, totalClients, totalServices, totalBookings,
      bookingsByStatus: { pending: pendingBookings, accepted: acceptedBookings, completed: completedBookings, cancelled: cancelledBookings },
      bookingsLast7Days: days,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend / unsuspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (admin)
const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    if (user.role === 'admin') return sendError(res, 400, 'Cannot suspend an admin account');

    user.isSuspended = !user.isSuspended;
    await user.save();

    const action = user.isSuspended ? 'suspended' : 'unsuspended';
    sendResponse(res, 200, `User ${action}`, { id: user._id, isSuspended: user.isSuspended });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user with bookings
// @route   GET /api/admin/users/:id
// @access  Private (admin)
const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    const bookingQuery = user.role === 'worker'
      ? { workerId: user._id }
      : { clientId: user._id };

    const bookings = await Booking.find(bookingQuery)
      .populate('clientId', 'name email')
      .populate('workerId', 'name email')
      .populate('serviceId', 'title category price')
      .sort({ createdAt: -1 })
      .limit(20);

    sendResponse(res, 200, 'User detail fetched', { user, bookings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserDetail, deleteUser, verifyWorker, suspendUser, getAllBookings, deleteService, getStats };

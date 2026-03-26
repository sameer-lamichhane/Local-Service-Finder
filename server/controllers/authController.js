const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const generateToken = require('../utils/generateToken');
const { sendResponse, sendError } = require('../utils/response');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    const allowedRoles = ['client', 'worker'];
    if (role && !allowedRoles.includes(role)) {
      return sendError(res, 400, 'Invalid role. Must be client or worker');
    }

    const user = await User.create({ name, email, password, role: role || 'client', location });

    // Auto-create worker profile
    if (user.role === 'worker') {
      await WorkerProfile.create({ userId: user._id, location });
    }

    const token = generateToken(user._id);

    sendResponse(res, 201, 'Registration successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    // Track last login IP and time
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    await User.findByIdAndUpdate(user._id, { lastIp: ip, lastLoginAt: new Date() });

    sendResponse(res, 200, 'Login successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    sendResponse(res, 200, 'Profile fetched', req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };

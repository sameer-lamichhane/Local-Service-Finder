const WorkerProfile = require('../models/WorkerProfile');
const { sendResponse, sendError } = require('../utils/response');

// @desc    Get own worker profile
// @route   GET /api/workers/profile
// @access  Private (worker)
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id }).populate('userId', 'name email location');
    if (!profile) return sendError(res, 404, 'Worker profile not found');
    sendResponse(res, 200, 'Profile fetched', profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private (worker)
const updateMyProfile = async (req, res, next) => {
  try {
    const { skills, experience, bio, hourlyRate, location } = req.body;

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { skills, experience, bio, hourlyRate, location },
      { new: true, runValidators: true }
    );

    if (!profile) return sendError(res, 404, 'Worker profile not found');
    sendResponse(res, 200, 'Profile updated', profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a worker's public profile
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.params.id }).populate(
      'userId',
      'name email location isVerified'
    );
    if (!profile) return sendError(res, 404, 'Worker not found');
    sendResponse(res, 200, 'Worker profile fetched', profile);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateMyProfile, getWorkerById };

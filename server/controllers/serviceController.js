const Service = require('../models/Service');
const { sendResponse, sendError } = require('../utils/response');

// @desc    Create service
// @route   POST /api/services
// @access  Private (worker)
const createService = async (req, res, next) => {
  try {
    const { title, category, description, price, location } = req.body;
    const service = await Service.create({
      title, category, description, price, location,
      workerId: req.user._id,
    });
    sendResponse(res, 201, 'Service created', service);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services (with filters + pagination + search)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { category, location, keyword, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = { $regex: category, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (keyword) query.$text = { $search: keyword };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('workerId', 'name location isVerified')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    sendResponse(res, 200, 'Services fetched', {
      services,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('workerId', 'name location isVerified');
    if (!service) return sendError(res, 404, 'Service not found');
    sendResponse(res, 200, 'Service fetched', service);
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (owner worker)
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return sendError(res, 404, 'Service not found');

    if (service.workerId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this service');
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    sendResponse(res, 200, 'Service updated', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (owner worker or admin)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return sendError(res, 404, 'Service not found');

    const isOwner = service.workerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'Not authorized to delete this service');
    }

    await service.deleteOne();
    sendResponse(res, 200, 'Service deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { createService, getServices, getService, updateService, deleteService };

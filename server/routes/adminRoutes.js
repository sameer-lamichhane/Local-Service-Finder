const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserDetail, deleteUser, verifyWorker, suspendUser, getAllBookings, deleteService, getStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.delete('/users/:id', deleteUser);
router.put('/workers/:id/verify', verifyWorker);
router.put('/users/:id/suspend', suspendUser);
router.get('/bookings', getAllBookings);
router.delete('/services/:id', deleteService);

module.exports = router;

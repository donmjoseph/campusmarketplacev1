const express = require('express');
const { body, param } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', asyncHandler(adminController.getDashboard));
router.get('/users', asyncHandler(adminController.getUsers));
router.patch(
  '/users/:id/status',
  [
    param('id').isMongoId(),
    body('status').isIn(['active', 'suspended']),
    body('suspensionReason').optional().trim().isLength({ max: 300 }),
  ],
  validateRequest,
  asyncHandler(adminController.updateUserStatus)
);

router.get('/listings', asyncHandler(adminController.getListings));
router.patch(
  '/listings/:id/moderate',
  [
    param('id').isMongoId(),
    body('action').isIn(['remove', 'restore']),
    body('reason').optional().trim().isLength({ max: 250 }),
  ],
  validateRequest,
  asyncHandler(adminController.moderateListing)
);

router.get('/orders', asyncHandler(adminController.getOrders));
router.get('/analytics', asyncHandler(adminController.getAnalytics));
router.get('/reports', asyncHandler(adminController.getReports));

router.patch(
  '/reports/:id/resolve',
  [
    param('id').isMongoId(),
    body('action').isIn(['dismiss', 'warn', 'suspend']),
    body('note').optional().trim().isLength({ max: 300 }),
  ],
  validateRequest,
  asyncHandler(adminController.resolveReport)
);

module.exports = router;

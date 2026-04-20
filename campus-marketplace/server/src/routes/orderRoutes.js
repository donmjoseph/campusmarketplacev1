const express = require('express');
const { body, param } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, requireRole } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post(
  '/checkout',
  requireAuth,
  requireRole('buyer'),
  [
    body('method').isIn(['pickup', 'shipping']),
    body('contactName').trim().isLength({ min: 2 }),
    body('contactPhone').trim().isLength({ min: 7 }),
    body('shippingAddress').optional().trim().isLength({ max: 250 }),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  asyncHandler(orderController.checkout)
);

router.get('/buyer', requireAuth, requireRole('buyer'), asyncHandler(orderController.getBuyerOrders));
router.get('/seller', requireAuth, requireRole('seller'), asyncHandler(orderController.getSellerOrders));

router.patch(
  '/:id/cancel-request',
  requireAuth,
  requireRole('buyer'),
  [
    param('id').isMongoId(),
    body('reason').trim().isLength({ min: 5 }).withMessage('Reason is required.'),
  ],
  validateRequest,
  asyncHandler(orderController.requestCancellation)
);

router.patch(
  '/:id/cancel-decision',
  requireAuth,
  requireRole('seller'),
  [
    param('id').isMongoId(),
    body('decision').isIn(['approved', 'denied']),
  ],
  validateRequest,
  asyncHandler(orderController.decideCancellation)
);

router.patch(
  '/:id/confirm',
  requireAuth,
  requireRole('seller'),
  [param('id').isMongoId()],
  validateRequest,
  asyncHandler(orderController.confirmOrder)
);

router.patch(
  '/:id/fulfill',
  requireAuth,
  requireRole('seller'),
  [param('id').isMongoId()],
  validateRequest,
  asyncHandler(orderController.markFulfilled)
);

module.exports = router;

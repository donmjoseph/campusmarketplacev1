const express = require('express');
const { body, param } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, requireRole } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.use(requireAuth, requireRole('buyer'));

router.get('/', asyncHandler(cartController.getCart));

router.post(
  '/items',
  [body('listingId').isMongoId().withMessage('listingId is required.')],
  validateRequest,
  asyncHandler(cartController.addToCart)
);

router.delete(
  '/items/:listingId',
  [param('listingId').isMongoId().withMessage('Invalid listing ID.')],
  validateRequest,
  asyncHandler(cartController.removeFromCart)
);

router.delete('/clear', asyncHandler(cartController.clearCart));

module.exports = router;

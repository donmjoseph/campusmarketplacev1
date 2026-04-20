const express = require('express');
const { body, param } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');
const listingController = require('../controllers/listingController');

const router = express.Router();

router.get('/', optionalAuth, asyncHandler(listingController.getListings));

router.get(
  '/:id',
  optionalAuth,
  [param('id').isMongoId().withMessage('Invalid listing ID.')],
  validateRequest,
  asyncHandler(listingController.getListingById)
);

router.post(
  '/',
  requireAuth,
  requireRole('seller', 'admin'),
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title is required.'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description is required.'),
    body('category').isIn(['Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other']),
    body('condition').isIn(['New', 'Like New', 'Good', 'Fair']),
    body('price').isFloat({ min: 0 }).withMessage('Price must be greater than or equal to 0.'),
    body('status').optional().isIn(['active', 'draft', 'inactive']),
  ],
  validateRequest,
  asyncHandler(listingController.createListing)
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('seller', 'admin'),
  [param('id').isMongoId().withMessage('Invalid listing ID.')],
  validateRequest,
  asyncHandler(listingController.updateListing)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('seller', 'admin'),
  [param('id').isMongoId().withMessage('Invalid listing ID.')],
  validateRequest,
  asyncHandler(listingController.deleteListing)
);

module.exports = router;

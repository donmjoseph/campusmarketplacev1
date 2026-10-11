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
  [param('id').isUUID().withMessage('Invalid listing ID.')],
  validateRequest,
  asyncHandler(listingController.getListingById)
);

router.post(
  '/',
  requireAuth,
  requireRole('seller', 'admin'),
  [
    body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters.'),
    body('description').trim().isLength({ min: 10, max: 4000 }).withMessage('Description must be 10-4000 characters.'),
    body('category').isIn(['Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other']),
    body('condition').isIn(['New', 'Like New', 'Good', 'Fair']),
    body('price').isFloat({ min: 0 }).withMessage('Price must be greater than or equal to 0.'),
    body('courseTag').optional().trim().isLength({ max: 40 }),
    body('images').optional().isArray(),
    body('status').optional().isIn(['active', 'draft', 'inactive']),
  ],
  validateRequest,
  asyncHandler(listingController.createListing)
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('seller', 'admin'),
  [
    param('id').isUUID().withMessage('Invalid listing ID.'),
    body('title').optional().trim().isLength({ min: 3, max: 120 }),
    body('description').optional().trim().isLength({ min: 10, max: 4000 }),
    body('category').optional().isIn(['Books', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Other']),
    body('condition').optional().isIn(['New', 'Like New', 'Good', 'Fair']),
    body('price').optional().isFloat({ min: 0 }),
    body('courseTag').optional().trim().isLength({ max: 40 }),
    body('images').optional().isArray(),
    body('status').optional().isIn(['active', 'draft', 'inactive', 'sold', 'removed']),
  ],
  validateRequest,
  asyncHandler(listingController.updateListing)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('seller', 'admin'),
  [param('id').isUUID().withMessage('Invalid listing ID.')],
  validateRequest,
  asyncHandler(listingController.deleteListing)
);

module.exports = router;

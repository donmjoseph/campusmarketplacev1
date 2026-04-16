const express = require('express');
const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/me', requireAuth, asyncHandler(userController.getMyProfile));

router.patch(
  '/me',
  requireAuth,
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
    body('email').optional().trim().isEmail().withMessage('Email must be valid.'),
    body('profile.phone').optional().trim().isLength({ max: 30 }),
    body('profile.location').optional().trim().isLength({ max: 120 }),
    body('profile.bio').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  asyncHandler(userController.updateMyProfile)
);

module.exports = router;

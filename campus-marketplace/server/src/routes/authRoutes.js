const express = require('express');
const { body } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
    body('email').trim().isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('role').optional().isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller.'),
  ],
  validateRequest,
  asyncHandler(authController.register)
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 1 }).withMessage('Password is required.'),
  ],
  validateRequest,
  asyncHandler(authController.login)
);

router.get('/me', requireAuth, asyncHandler(authController.me));

module.exports = router;

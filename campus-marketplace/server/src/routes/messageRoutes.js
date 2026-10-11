const express = require('express');
const { body, param } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.use(requireAuth);

router.get('/unread-count', asyncHandler(messageController.getUnreadCount));
router.get('/conversations', asyncHandler(messageController.getConversations));

router.post(
  '/conversations',
  [
    body('listingId').isUUID(),
    body('initialMessage').optional().trim().isLength({ max: 1000 }),
  ],
  validateRequest,
  asyncHandler(messageController.startConversation)
);

router.get(
  '/conversations/:id',
  [param('id').isUUID()],
  validateRequest,
  asyncHandler(messageController.getConversation)
);

router.post(
  '/conversations/:id/messages',
  [
    param('id').isUUID(),
    body('body').trim().isLength({ min: 1, max: 1000 }),
  ],
  validateRequest,
  asyncHandler(messageController.sendMessage)
);

router.post(
  '/conversations/:id/report',
  [
    param('id').isUUID(),
    body('reason').trim().isLength({ min: 8, max: 500 }),
  ],
  validateRequest,
  asyncHandler(messageController.reportConversation)
);

module.exports = router;

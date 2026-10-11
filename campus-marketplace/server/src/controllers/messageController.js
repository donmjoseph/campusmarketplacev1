const conversationRepository = require('../repositories/conversationRepository');
const listingRepository = require('../repositories/listingRepository');
const reportRepository = require('../repositories/reportRepository');
const AppError = require('../utils/AppError');

function isParticipant(conversation, userId) {
  return conversation.participants.some((participant) => String(participant._id) === String(userId));
}

async function getUnreadCount(req, res) {
  const count = await conversationRepository.countUnread(req.user._id);
  res.json({ success: true, count });
}

async function getConversations(req, res) {
  const conversations = await conversationRepository.findForUser(req.user._id);

  const mapped = conversations.map((conversation) => ({
    ...conversation,
    otherUser: conversation.participants.find(
      (participant) => String(participant._id) !== String(req.user._id)
    ),
    unread: conversation.unreadBy.some((id) => String(id) === String(req.user._id)),
  }));

  res.json({
    success: true,
    count: mapped.length,
    conversations: mapped,
  });
}

async function startConversation(req, res) {
  const { listingId, initialMessage } = req.body;
  const listing = await listingRepository.findById(listingId);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  const sellerId = listing.seller._id;

  if (String(sellerId) === String(req.user._id)) {
    throw new AppError('You cannot message yourself.', 400);
  }

  let conversationId = await conversationRepository.findIdByListingAndUsers(listing._id, req.user._id, sellerId);

  if (!conversationId) {
    conversationId = await conversationRepository.create({
      listingId: listing._id,
      userId1: req.user._id,
      userId2: sellerId,
      unreadFor: [sellerId],
    });
  }

  if (initialMessage && initialMessage.trim()) {
    await conversationRepository.addMessage(conversationId, req.user._id, initialMessage.trim());
  }

  res.status(201).json({
    success: true,
    conversation: await conversationRepository.findById(conversationId),
  });
}

async function getConversation(req, res) {
  const conversation = await conversationRepository.findById(req.params.id);

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  if (!isParticipant(conversation, req.user._id)) {
    throw new AppError('Not allowed to access this conversation.', 403);
  }

  await conversationRepository.markRead(conversation._id, req.user._id);
  conversation.unreadBy = conversation.unreadBy.filter((id) => String(id) !== String(req.user._id));

  res.json({ success: true, conversation });
}

async function sendMessage(req, res) {
  const { body } = req.body;
  const conversation = await conversationRepository.findById(req.params.id);

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  if (!isParticipant(conversation, req.user._id)) {
    throw new AppError('Not allowed to send message in this conversation.', 403);
  }

  await conversationRepository.addMessage(conversation._id, req.user._id, body.trim());

  res.status(201).json({
    success: true,
    conversation: await conversationRepository.findById(conversation._id),
  });
}

async function reportConversation(req, res) {
  const { reason } = req.body;
  const conversation = await conversationRepository.findById(req.params.id);

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  if (!isParticipant(conversation, req.user._id)) {
    throw new AppError('Not allowed to report this conversation.', 403);
  }

  const againstUser = conversation.participants.find(
    (participant) => String(participant._id) !== String(req.user._id)
  );

  if (!againstUser) {
    throw new AppError('Unable to resolve reported user.', 400);
  }

  const report = await reportRepository.create({
    conversationId: conversation._id,
    reporterId: req.user._id,
    againstUserId: againstUser._id,
    reason,
  });

  res.status(201).json({
    success: true,
    message: 'Conversation reported to admin.',
    report,
  });
}

module.exports = {
  getUnreadCount,
  getConversations,
  startConversation,
  getConversation,
  sendMessage,
  reportConversation,
};

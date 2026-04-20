const Conversation = require('../models/Conversation');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const AppError = require('../utils/AppError');

async function getUnreadCount(req, res) {
  const count = await Conversation.countDocuments({
    participants: req.user._id,
    unreadBy: req.user._id,
  });
  res.json({ success: true, count });
}

async function getConversations(req, res) {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name email role')
    .populate('listing', 'title images status')
    .sort({ lastMessageAt: -1 });

  const mapped = conversations.map((conversation) => {
    const otherUser = conversation.participants.find(
      (participant) => String(participant._id) !== String(req.user._id)
    );

    return {
      ...conversation.toObject(),
      otherUser,
      unread: conversation.unreadBy.some((id) => String(id) === String(req.user._id)),
    };
  });

  res.json({
    success: true,
    count: mapped.length,
    conversations: mapped,
  });
}

async function startConversation(req, res) {
  const { listingId, initialMessage } = req.body;
  const listing = await Listing.findById(listingId).populate('seller');

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  if (String(listing.seller._id) === String(req.user._id)) {
    throw new AppError('You cannot message yourself.', 400);
  }

  const participantIds = [req.user._id, listing.seller._id]
    .map(String)
    .sort();

  let conversation = await Conversation.findOne({
    listing: listing._id,
    participants: { $all: participantIds, $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      listing: listing._id,
      participants: participantIds,
      messages: [],
      unreadBy: [listing.seller._id],
      lastMessageAt: new Date(),
    });
  }

  if (initialMessage && initialMessage.trim()) {
    conversation.messages.push({
      sender: req.user._id,
      body: initialMessage.trim(),
      createdAt: new Date(),
    });
    conversation.unreadBy = [listing.seller._id];
    conversation.lastMessageAt = new Date();
    await conversation.save();
  }

  const populated = await Conversation.findById(conversation._id)
    .populate('participants', 'name email role')
    .populate('listing', 'title images status');

  res.status(201).json({
    success: true,
    conversation: populated,
  });
}

async function getConversation(req, res) {
  const conversation = await Conversation.findById(req.params.id)
    .populate('participants', 'name email role')
    .populate('listing', 'title images status')
    .populate('messages.sender', 'name role');

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  const isParticipant = conversation.participants.some(
    (participant) => String(participant._id || participant) === String(req.user._id)
  );

  if (!isParticipant) {
    throw new AppError('Not allowed to access this conversation.', 403);
  }

  conversation.unreadBy = conversation.unreadBy.filter((id) => String(id) !== String(req.user._id));
  await conversation.save();

  res.json({ success: true, conversation });
}

async function sendMessage(req, res) {
  const { body } = req.body;
  const conversation = await Conversation.findById(req.params.id).populate('participants', 'name email role');

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  const isParticipant = conversation.participants.some(
    (participant) => String(participant._id || participant) === String(req.user._id)
  );

  if (!isParticipant) {
    throw new AppError('Not allowed to send message in this conversation.', 403);
  }

  conversation.messages.push({
    sender: req.user._id,
    body: body.trim(),
    createdAt: new Date(),
  });

  conversation.lastMessageAt = new Date();
  conversation.unreadBy = conversation.participants
    .filter((participant) => String(participant._id || participant) !== String(req.user._id))
    .map((participant) => participant._id || participant);

  await conversation.save();

  const updated = await Conversation.findById(conversation._id)
    .populate('participants', 'name email role')
    .populate('listing', 'title images status')
    .populate('messages.sender', 'name role');

  res.status(201).json({
    success: true,
    conversation: updated,
  });
}

async function reportConversation(req, res) {
  const { reason } = req.body;
  const conversation = await Conversation.findById(req.params.id).populate('participants', 'name role');

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  const isParticipant = conversation.participants.some(
    (participant) => String(participant._id || participant) === String(req.user._id)
  );

  if (!isParticipant) {
    throw new AppError('Not allowed to report this conversation.', 403);
  }

  const againstUser = conversation.participants.find(
    (participant) => String(participant._id || participant) !== String(req.user._id)
  );

  if (!againstUser) {
    throw new AppError('Unable to resolve reported user.', 400);
  }

  const report = await Report.create({
    conversation: conversation._id,
    reporter: req.user._id,
    againstUser: againstUser._id,
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

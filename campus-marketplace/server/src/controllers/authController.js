const User = require('../models/User');
const AppError = require('../utils/AppError');
const issueToken = require('../utils/issueToken');
const toPublicUser = require('../utils/toPublicUser');

const WSU_EMAIL_REGEX = /^[^\s@]+@(wsu\.edu|email\.wsu\.edu|vet\.wsu\.edu)$/i;

async function register(req, res) {
  const { name, email, password, role } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (!WSU_EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError('Only WSU email addresses are allowed.', 400);
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const safeRole = role === 'seller' ? 'seller' : 'buyer';

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: safeRole,
  });

  const token = issueToken(user);

  res.status(201).json({
    success: true,
    token,
    user: toPublicUser(user),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.status === 'suspended') {
    throw new AppError(`Account suspended. ${user.suspensionReason || 'Contact support.'}`, 403);
  }

  const token = issueToken(user);

  res.json({
    success: true,
    token,
    user: toPublicUser(user),
  });
}

async function me(req, res) {
  const user = await User.findById(req.user._id).populate({
    path: 'cartItems.listing',
    select: 'title price status images seller',
  });

  res.json({
    success: true,
    user: toPublicUser(user),
    cartCount: user.cartItems.length,
  });
}

module.exports = {
  register,
  login,
  me,
};

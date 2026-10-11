const userRepository = require('../repositories/userRepository');
const cartRepository = require('../repositories/cartRepository');
const AppError = require('../utils/AppError');
const issueToken = require('../utils/issueToken');
const toPublicUser = require('../utils/toPublicUser');
const { hashPassword, comparePassword } = require('../utils/password');

const WSU_EMAIL_REGEX = /^[^\s@]+@(wsu\.edu|email\.wsu\.edu|vet\.wsu\.edu)$/i;

async function register(req, res) {
  const { name, email, password, role } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (!WSU_EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError('Only WSU email addresses are allowed.', 400);
  }

  if (await userRepository.emailExists(normalizedEmail)) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const safeRole = role === 'seller' ? 'seller' : 'buyer';

  const user = await userRepository.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
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

  const found = await userRepository.findByEmailWithPassword(email.trim().toLowerCase());

  if (!found) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await comparePassword(password, found.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const { user } = found;

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
  res.json({
    success: true,
    user: toPublicUser(req.user),
    cartCount: await cartRepository.count(req.user._id),
  });
}

module.exports = {
  register,
  login,
  me,
};

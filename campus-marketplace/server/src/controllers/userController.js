const User = require('../models/User');
const AppError = require('../utils/AppError');
const toPublicUser = require('../utils/toPublicUser');

const WSU_EMAIL_REGEX = /^[^\s@]+@(wsu\.edu|email\.wsu\.edu|vet\.wsu\.edu)$/i;

async function getMyProfile(req, res) {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    user: toPublicUser(user),
  });
}

async function updateMyProfile(req, res) {
  const { name, email, profile, notificationPrefs } = req.body;

  const user = await User.findById(req.user._id);

  if (name) {
    user.name = name;
  }

  if (email) {
    const normalized = email.trim().toLowerCase();
    if (!WSU_EMAIL_REGEX.test(normalized)) {
      throw new AppError('Only WSU email addresses are allowed.', 400);
    }

    if (normalized !== user.email) {
      const exists = await User.exists({ email: normalized });
      if (exists) {
        throw new AppError('Email already in use.', 409);
      }
    }

    user.email = normalized;
  }

  if (profile) {
    user.profile = {
      ...user.profile,
      ...profile,
    };
  }

  if (notificationPrefs) {
    user.notificationPrefs = {
      ...user.notificationPrefs,
      ...notificationPrefs,
    };
  }

  await user.save();

  res.json({
    success: true,
    user: toPublicUser(user),
  });
}

module.exports = {
  getMyProfile,
  updateMyProfile,
};

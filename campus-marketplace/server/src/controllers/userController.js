const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const toPublicUser = require('../utils/toPublicUser');

const WSU_EMAIL_REGEX = /^[^\s@]+@(wsu\.edu|email\.wsu\.edu|vet\.wsu\.edu)$/i;

async function getMyProfile(req, res) {
  res.json({
    success: true,
    user: toPublicUser(req.user),
  });
}

async function updateMyProfile(req, res) {
  const { name, email, profile, notificationPrefs } = req.body;

  const user = { ...req.user };

  if (name) {
    user.name = name;
  }

  if (email) {
    const normalized = email.trim().toLowerCase();
    if (!WSU_EMAIL_REGEX.test(normalized)) {
      throw new AppError('Only WSU email addresses are allowed.', 400);
    }

    if (normalized !== user.email && (await userRepository.emailExists(normalized))) {
      throw new AppError('Email already in use.', 409);
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

  const updated = await userRepository.updateProfile(user._id, user);

  res.json({
    success: true,
    user: toPublicUser(updated),
  });
}

module.exports = {
  getMyProfile,
  updateMyProfile,
};

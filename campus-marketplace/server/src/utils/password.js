const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

function comparePassword(candidate, passwordHash) {
  return bcrypt.compare(candidate, passwordHash);
}

module.exports = {
  hashPassword,
  comparePassword,
};

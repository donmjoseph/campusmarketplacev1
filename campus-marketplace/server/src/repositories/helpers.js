const crypto = require('crypto');

function newId() {
  return crypto.randomUUID();
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function likePattern(term) {
  return `%${String(term).replace(/[\\%_]/g, '\\$&')}%`;
}

function placeholders(values) {
  return values.map(() => '?').join(', ');
}

module.exports = {
  newId,
  parseJsonArray,
  likePattern,
  placeholders,
};

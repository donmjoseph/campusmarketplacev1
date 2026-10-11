const { query, queryOne } = require('../config/database');
const { newId, likePattern, toBool } = require('./helpers');

const USER_COLUMNS = `
  id, name, email, role, status, suspension_reason, phone, location, bio,
  notify_order_updates, notify_messages, notify_promotions, created_at, updated_at
`;

function toUser(row) {
  if (!row) return null;

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    suspensionReason: row.suspension_reason,
    profile: {
      phone: row.phone,
      location: row.location,
      bio: row.bio,
    },
    notificationPrefs: {
      orderUpdates: toBool(row.notify_order_updates),
      messages: toBool(row.notify_messages),
      promotions: toBool(row.notify_promotions),
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findById(id) {
  return toUser(await queryOne(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [id]));
}

async function findByEmailWithPassword(email) {
  const row = await queryOne(`SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = ?`, [email]);
  if (!row) return null;
  return { user: toUser(row), passwordHash: row.password_hash };
}

async function emailExists(email) {
  return Boolean(await queryOne('SELECT 1 AS found FROM users WHERE email = ?', [email]));
}

function insertStatement({
  id = newId(),
  name,
  email,
  passwordHash,
  role = 'buyer',
  profile = {},
  createdAt = new Date(),
  updatedAt = createdAt,
}) {
  return [
    `INSERT INTO users (id, name, email, password_hash, role, phone, location, bio, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name,
      email,
      passwordHash,
      role,
      profile.phone || '',
      profile.location || '',
      profile.bio || '',
      createdAt,
      updatedAt,
    ],
  ];
}

async function create(fields) {
  const id = fields.id || newId();
  const [sql, params] = insertStatement({ ...fields, id });
  await query(sql, params);
  return findById(id);
}

async function updateProfile(id, user) {
  await query(
    `UPDATE users
     SET name = ?, email = ?, phone = ?, location = ?, bio = ?,
         notify_order_updates = ?, notify_messages = ?, notify_promotions = ?, updated_at = ?
     WHERE id = ?`,
    [
      user.name,
      user.email,
      user.profile.phone || '',
      user.profile.location || '',
      user.profile.bio || '',
      Boolean(user.notificationPrefs.orderUpdates),
      Boolean(user.notificationPrefs.messages),
      Boolean(user.notificationPrefs.promotions),
      new Date(),
      id,
    ]
  );
  return findById(id);
}

function updateStatusStatement(id, status, suspensionReason) {
  return [
    'UPDATE users SET status = ?, suspension_reason = ?, updated_at = ? WHERE id = ?',
    [status, suspensionReason, new Date(), id],
  ];
}

async function updateStatus(id, status, suspensionReason) {
  const [sql, params] = updateStatusStatement(id, status, suspensionReason);
  await query(sql, params);
  return findById(id);
}

async function findMany({ q, role, status } = {}) {
  const where = [];
  const params = [];

  if (role) {
    where.push('role = ?');
    params.push(role);
  }
  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  if (q) {
    where.push('(name LIKE ? OR email LIKE ?)');
    params.push(likePattern(q), likePattern(q));
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query(`SELECT ${USER_COLUMNS} FROM users ${whereSql} ORDER BY created_at DESC`, params);
  return rows.map(toUser);
}

async function findRecent(limit) {
  const rows = await query(`SELECT ${USER_COLUMNS} FROM users ORDER BY created_at DESC LIMIT ?`, [limit]);
  return rows.map(toUser);
}

async function count() {
  const row = await queryOne('SELECT COUNT(*) AS total FROM users');
  return Number(row.total);
}

async function signupsByDay(since) {
  const rows = await query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS count
     FROM users
     WHERE created_at >= ?
     GROUP BY day
     ORDER BY day`,
    [since]
  );
  return rows.map((row) => ({ _id: row.day, count: Number(row.count) }));
}

module.exports = {
  toUser,
  findById,
  findByEmailWithPassword,
  emailExists,
  insertStatement,
  create,
  updateProfile,
  updateStatusStatement,
  updateStatus,
  findMany,
  findRecent,
  count,
  signupsByDay,
};

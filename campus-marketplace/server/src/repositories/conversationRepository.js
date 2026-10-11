const { query, queryOne, batch } = require('../config/database');
const { newId, parseJsonArray, toBool, placeholders } = require('./helpers');

const CONVERSATION_SELECT = `
  SELECT c.*,
         l.title AS listing_title, l.images AS listing_images, l.status AS listing_status,
         ua.name AS a_name, ua.email AS a_email, ua.role AS a_role,
         ub.name AS b_name, ub.email AS b_email, ub.role AS b_role
  FROM conversations c
  JOIN users ua ON ua.id = c.user_a_id
  JOIN users ub ON ub.id = c.user_b_id
  LEFT JOIN listings l ON l.id = c.listing_id
`;

function orderedPair(userId1, userId2) {
  return [String(userId1), String(userId2)].sort();
}

function toConversation(row, messages = []) {
  const unreadBy = [];
  if (toBool(row.unread_a)) unreadBy.push(row.user_a_id);
  if (toBool(row.unread_b)) unreadBy.push(row.user_b_id);

  return {
    _id: row.id,
    listing: row.listing_title == null
      ? null
      : {
        _id: row.listing_id,
        title: row.listing_title,
        images: parseJsonArray(row.listing_images),
        status: row.listing_status,
      },
    participants: [
      { _id: row.user_a_id, name: row.a_name, email: row.a_email, role: row.a_role },
      { _id: row.user_b_id, name: row.b_name, email: row.b_email, role: row.b_role },
    ],
    messages,
    unreadBy,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadMessages(conversationIds) {
  const byConversation = new Map(conversationIds.map((id) => [id, []]));
  if (!conversationIds.length) return byConversation;

  const rows = await query(
    `SELECT m.*, u.name AS sender_name, u.role AS sender_role
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id IN (${placeholders(conversationIds)})
     ORDER BY m.created_at ASC`,
    conversationIds
  );

  for (const row of rows) {
    byConversation.get(row.conversation_id).push({
      _id: row.id,
      sender: { _id: row.sender_id, name: row.sender_name, role: row.sender_role },
      body: row.body,
      createdAt: row.created_at,
    });
  }

  return byConversation;
}

async function findById(id) {
  const row = await queryOne(`${CONVERSATION_SELECT} WHERE c.id = ?`, [id]);
  if (!row) return null;
  const messages = await loadMessages([row.id]);
  return toConversation(row, messages.get(row.id));
}

async function findForUser(userId) {
  const rows = await query(
    `${CONVERSATION_SELECT} WHERE c.user_a_id = ? OR c.user_b_id = ? ORDER BY c.last_message_at DESC`,
    [userId, userId]
  );
  const messages = await loadMessages(rows.map((row) => row.id));
  return rows.map((row) => toConversation(row, messages.get(row.id)));
}

async function findIdByListingAndUsers(listingId, userId1, userId2) {
  const [userA, userB] = orderedPair(userId1, userId2);
  const row = await queryOne(
    'SELECT id FROM conversations WHERE listing_id = ? AND user_a_id = ? AND user_b_id = ?',
    [listingId, userA, userB]
  );
  return row ? row.id : null;
}

function insertStatement({ id = newId(), listingId, userId1, userId2, unreadFor = [], lastMessageAt, createdAt, updatedAt }) {
  const [userA, userB] = orderedPair(userId1, userId2);
  const unread = unreadFor.map(String);
  const now = new Date();

  return [
    `INSERT INTO conversations
       (id, listing_id, user_a_id, user_b_id, unread_a, unread_b, last_message_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      listingId,
      userA,
      userB,
      unread.includes(userA),
      unread.includes(userB),
      lastMessageAt || now,
      createdAt || now,
      updatedAt || createdAt || now,
    ],
  ];
}

async function create(fields) {
  const id = newId();
  const [sql, params] = insertStatement({ ...fields, id });
  await query(sql, params);
  return id;
}

function messageInsertStatement({ id = newId(), conversationId, senderId, body, createdAt = new Date() }) {
  return [
    'INSERT INTO messages (id, conversation_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, conversationId, senderId, body, createdAt],
  ];
}

async function addMessage(conversationId, senderId, body) {
  const now = new Date();
  await batch([
    messageInsertStatement({ conversationId, senderId, body, createdAt: now }),
    [
      `UPDATE conversations
       SET unread_a = (user_a_id <> ?), unread_b = (user_b_id <> ?), last_message_at = ?, updated_at = ?
       WHERE id = ?`,
      [senderId, senderId, now, now, conversationId],
    ],
  ]);
}

async function markRead(conversationId, userId) {
  await query(
    `UPDATE conversations
     SET unread_a = CASE WHEN user_a_id = ? THEN 0 ELSE unread_a END,
         unread_b = CASE WHEN user_b_id = ? THEN 0 ELSE unread_b END
     WHERE id = ?`,
    [userId, userId, conversationId]
  );
}

async function countUnread(userId) {
  const row = await queryOne(
    `SELECT COUNT(*) AS total FROM conversations
     WHERE (user_a_id = ? AND unread_a = 1) OR (user_b_id = ? AND unread_b = 1)`,
    [userId, userId]
  );
  return Number(row.total);
}

module.exports = {
  findById,
  findForUser,
  findIdByListingAndUsers,
  insertStatement,
  create,
  messageInsertStatement,
  addMessage,
  markRead,
  countUnread,
};

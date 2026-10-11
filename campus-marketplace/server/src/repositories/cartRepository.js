const { query, queryOne } = require('../config/database');
const listingRepository = require('./listingRepository');

async function findItems(userId) {
  const rows = await query(
    `SELECT c.added_at, l.*,
            u.name AS seller_name, u.email AS seller_email, u.role AS seller_role,
            u.phone AS seller_phone, u.location AS seller_location, u.bio AS seller_bio
     FROM cart_items c
     JOIN listings l ON l.id = c.listing_id
     JOIN users u ON u.id = l.seller_id
     WHERE c.user_id = ?
     ORDER BY c.added_at ASC`,
    [userId]
  );

  return rows.map((row) => ({
    listing: listingRepository.toListing(row),
    addedAt: row.added_at,
  }));
}

async function count(userId) {
  const row = await queryOne('SELECT COUNT(*) AS total FROM cart_items WHERE user_id = ?', [userId]);
  return Number(row.total);
}

async function hasItem(userId, listingId) {
  return Boolean(
    await queryOne('SELECT 1 AS found FROM cart_items WHERE user_id = ? AND listing_id = ?', [userId, listingId])
  );
}

function addStatement(userId, listingId, addedAt = new Date()) {
  return ['INSERT INTO cart_items (user_id, listing_id, added_at) VALUES (?, ?, ?)', [userId, listingId, addedAt]];
}

async function add(userId, listingId) {
  const [sql, params] = addStatement(userId, listingId);
  await query(sql, params);
}

async function remove(userId, listingId) {
  await query('DELETE FROM cart_items WHERE user_id = ? AND listing_id = ?', [userId, listingId]);
}

function clearStatement(userId) {
  return ['DELETE FROM cart_items WHERE user_id = ?', [userId]];
}

async function clear(userId) {
  const [sql, params] = clearStatement(userId);
  await query(sql, params);
}

module.exports = {
  findItems,
  count,
  hasItem,
  addStatement,
  add,
  remove,
  clearStatement,
  clear,
};

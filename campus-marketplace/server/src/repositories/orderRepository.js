const { query, queryOne } = require('../config/database');
const { newId, parseJsonArray, likePattern, placeholders } = require('./helpers');

const ORDER_SELECT = `
  SELECT o.*,
         b.name AS buyer_name, b.email AS buyer_email,
         s.name AS seller_name, s.email AS seller_email,
         l.title AS listing_title, l.images AS listing_images, l.status AS listing_status
  FROM orders o
  JOIN users b ON b.id = o.buyer_id
  JOIN users s ON s.id = o.seller_id
  LEFT JOIN listings l ON l.id = o.listing_id
`;

function toOrder(row) {
  if (!row) return null;

  return {
    _id: row.id,
    orderNumber: row.order_number,
    buyer: { _id: row.buyer_id, name: row.buyer_name, email: row.buyer_email },
    seller: { _id: row.seller_id, name: row.seller_name, email: row.seller_email },
    listing: row.listing_title == null
      ? null
      : {
        _id: row.listing_id,
        title: row.listing_title,
        images: parseJsonArray(row.listing_images),
        status: row.listing_status,
      },
    titleSnapshot: row.title_snapshot,
    priceSnapshot: Number(row.price_snapshot),
    status: row.status,
    checkout: {
      method: row.checkout_method,
      contactName: row.contact_name,
      contactPhone: row.contact_phone,
      shippingAddress: row.shipping_address,
      notes: row.notes,
    },
    cancellation: {
      requested: Boolean(row.cancel_requested),
      reason: row.cancel_reason,
      requestedAt: row.cancel_requested_at,
      decision: row.cancel_decision,
      reviewedAt: row.cancel_reviewed_at,
      reviewedBy: row.cancel_reviewed_by,
    },
    fulfilledAt: row.fulfilled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findById(id) {
  return toOrder(await queryOne(`${ORDER_SELECT} WHERE o.id = ?`, [id]));
}

async function findByIds(ids) {
  if (!ids.length) return [];
  const rows = await query(`${ORDER_SELECT} WHERE o.id IN (${placeholders(ids)}) ORDER BY o.created_at DESC`, ids);
  return rows.map(toOrder);
}

async function findMany({ buyerId, sellerId, status, q, limit } = {}) {
  const where = [];
  const params = [];

  if (buyerId) {
    where.push('o.buyer_id = ?');
    params.push(buyerId);
  }
  if (sellerId) {
    where.push('o.seller_id = ?');
    params.push(sellerId);
  }
  if (status) {
    where.push('o.status = ?');
    params.push(status);
  }
  if (q) {
    where.push('(o.order_number LIKE ? OR o.title_snapshot LIKE ?)');
    params.push(likePattern(q), likePattern(q));
  }

  let sql = ORDER_SELECT;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ' ORDER BY o.created_at DESC';
  if (limit) {
    sql += ' LIMIT ?';
    params.push(limit);
  }

  const rows = await query(sql, params);
  return rows.map(toOrder);
}

function insertStatement({
  id = newId(),
  orderNumber,
  buyerId,
  sellerId,
  listingId,
  titleSnapshot,
  priceSnapshot,
  status = 'pending',
  checkout,
  cancellation = {},
  fulfilledAt = null,
  createdAt = new Date(),
  updatedAt = createdAt,
}) {
  return [
    `INSERT INTO orders
       (id, order_number, buyer_id, seller_id, listing_id, title_snapshot, price_snapshot, status,
        checkout_method, contact_name, contact_phone, shipping_address, notes,
        cancel_requested, cancel_reason, cancel_requested_at, cancel_decision, cancel_reviewed_at, cancel_reviewed_by,
        fulfilled_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderNumber,
      buyerId,
      sellerId,
      listingId,
      titleSnapshot,
      priceSnapshot,
      status,
      checkout.method,
      checkout.contactName,
      checkout.contactPhone,
      checkout.shippingAddress || '',
      checkout.notes || '',
      Boolean(cancellation.requested),
      cancellation.reason || '',
      cancellation.requestedAt || null,
      cancellation.decision || 'pending',
      cancellation.reviewedAt || null,
      cancellation.reviewedBy || null,
      fulfilledAt,
      createdAt,
      updatedAt,
    ],
  ];
}

function updateStatement(id, { status, cancellation, fulfilledAt }) {
  const sets = ['status = ?'];
  const params = [status];

  if (cancellation) {
    sets.push(
      'cancel_requested = ?',
      'cancel_reason = ?',
      'cancel_requested_at = ?',
      'cancel_decision = ?',
      'cancel_reviewed_at = ?',
      'cancel_reviewed_by = ?'
    );
    params.push(
      Boolean(cancellation.requested),
      cancellation.reason || '',
      cancellation.requestedAt || null,
      cancellation.decision || 'pending',
      cancellation.reviewedAt || null,
      cancellation.reviewedBy || null
    );
  }

  if (fulfilledAt !== undefined) {
    sets.push('fulfilled_at = ?');
    params.push(fulfilledAt);
  }

  sets.push('updated_at = ?');
  params.push(new Date(), id);

  return [`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`, params];
}

async function update(id, changes) {
  const [sql, params] = updateStatement(id, changes);
  await query(sql, params);
  return findById(id);
}

async function count() {
  const row = await queryOne('SELECT COUNT(*) AS total FROM orders');
  return Number(row.total);
}

async function totalRevenue() {
  const row = await queryOne('SELECT COALESCE(SUM(price_snapshot), 0) AS total FROM orders');
  return Number(row.total);
}

async function countByStatus() {
  const rows = await query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC');
  return rows.map((row) => ({ _id: row.status, count: Number(row.count) }));
}

async function revenueByDay(since) {
  const rows = await query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, SUM(price_snapshot) AS revenue, COUNT(*) AS count
     FROM orders
     WHERE created_at >= ?
     GROUP BY day
     ORDER BY day`,
    [since]
  );
  return rows.map((row) => ({ _id: row.day, revenue: Number(row.revenue), count: Number(row.count) }));
}

async function topListings(limit) {
  const rows = await query(
    `SELECT listing_id, COUNT(*) AS count, MIN(title_snapshot) AS title
     FROM orders
     GROUP BY listing_id
     ORDER BY count DESC
     LIMIT ?`,
    [limit]
  );
  return rows.map((row) => ({ _id: row.listing_id, count: Number(row.count), title: row.title }));
}

module.exports = {
  toOrder,
  findById,
  findByIds,
  findMany,
  insertStatement,
  updateStatement,
  update,
  count,
  totalRevenue,
  countByStatus,
  revenueByDay,
  topListings,
};

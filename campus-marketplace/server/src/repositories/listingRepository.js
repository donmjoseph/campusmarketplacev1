const { query, queryOne } = require('../config/database');
const { newId, parseJsonArray, likePattern } = require('./helpers');

const LISTING_SELECT = `
  SELECT l.*,
         u.name AS seller_name, u.email AS seller_email, u.role AS seller_role,
         u.phone AS seller_phone, u.location AS seller_location, u.bio AS seller_bio
  FROM listings l
  JOIN users u ON u.id = l.seller_id
`;

const SORTS = {
  newest: 'l.created_at DESC',
  oldest: 'l.created_at ASC',
  price_asc: 'l.price ASC',
  price_desc: 'l.price DESC',
};

function toListing(row) {
  if (!row) return null;

  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    condition: row.item_condition,
    price: Number(row.price),
    courseTag: row.course_tag,
    images: parseJsonArray(row.images),
    status: row.status,
    seller: {
      _id: row.seller_id,
      name: row.seller_name,
      email: row.seller_email,
      role: row.seller_role,
      profile: {
        phone: row.seller_phone,
        location: row.seller_location,
        bio: row.seller_bio,
      },
    },
    views: Number(row.views),
    removedReason: row.removed_reason,
    removedBy: row.removed_by,
    removedAt: row.removed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findById(id) {
  return toListing(await queryOne(`${LISTING_SELECT} WHERE l.id = ?`, [id]));
}

async function findMany({
  status,
  sellerId,
  category,
  condition,
  courseTag,
  q,
  minPrice,
  maxPrice,
  sort,
  limit,
} = {}) {
  const where = [];
  const params = [];

  if (status) {
    where.push('l.status = ?');
    params.push(status);
  }
  if (sellerId) {
    where.push('l.seller_id = ?');
    params.push(sellerId);
  }
  if (category) {
    where.push('l.category = ?');
    params.push(category);
  }
  if (condition) {
    where.push('l.item_condition = ?');
    params.push(condition);
  }
  if (courseTag) {
    where.push('l.course_tag LIKE ?');
    params.push(likePattern(courseTag));
  }
  if (q) {
    where.push('(l.title LIKE ? OR l.description LIKE ? OR l.course_tag LIKE ?)');
    params.push(likePattern(q), likePattern(q), likePattern(q));
  }
  if (Number.isFinite(minPrice)) {
    where.push('l.price >= ?');
    params.push(minPrice);
  }
  if (Number.isFinite(maxPrice)) {
    where.push('l.price <= ?');
    params.push(maxPrice);
  }

  let sql = LISTING_SELECT;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY ${SORTS[sort] || SORTS.newest}`;
  if (limit) {
    sql += ' LIMIT ?';
    params.push(limit);
  }

  const rows = await query(sql, params);
  return rows.map(toListing);
}

function insertStatement({
  id = newId(),
  sellerId,
  title,
  description,
  category,
  condition,
  price,
  courseTag = '',
  images = [],
  status = 'active',
  createdAt = new Date(),
  updatedAt = createdAt,
}) {
  return [
    `INSERT INTO listings
       (id, seller_id, title, description, category, item_condition, price, course_tag, images, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      sellerId,
      title,
      description,
      category,
      condition,
      price,
      courseTag,
      JSON.stringify(images),
      status,
      createdAt,
      updatedAt,
    ],
  ];
}

async function create(fields) {
  const id = newId();
  const [sql, params] = insertStatement({ ...fields, id });
  await query(sql, params);
  return findById(id);
}

const EDITABLE_COLUMNS = {
  title: 'title',
  description: 'description',
  category: 'category',
  condition: 'item_condition',
  price: 'price',
  courseTag: 'course_tag',
  images: 'images',
  status: 'status',
};

async function update(id, changes) {
  const sets = [];
  const params = [];

  for (const [field, column] of Object.entries(EDITABLE_COLUMNS)) {
    if (field in changes) {
      sets.push(`${column} = ?`);
      params.push(field === 'images' ? JSON.stringify(changes.images || []) : changes[field]);
    }
  }

  sets.push('updated_at = ?');
  params.push(new Date(), id);

  await query(`UPDATE listings SET ${sets.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

function setStatusStatement(id, status, updatedAt = new Date()) {
  return ['UPDATE listings SET status = ?, updated_at = ? WHERE id = ?', [status, updatedAt, id]];
}

async function setModeration(id, { status, removedReason, removedBy, removedAt }) {
  await query(
    'UPDATE listings SET status = ?, removed_reason = ?, removed_by = ?, removed_at = ?, updated_at = ? WHERE id = ?',
    [status, removedReason, removedBy, removedAt, new Date(), id]
  );
  return findById(id);
}

async function incrementViews(id) {
  await query('UPDATE listings SET views = views + 1 WHERE id = ?', [id]);
}

async function remove(id) {
  await query('DELETE FROM listings WHERE id = ?', [id]);
}

async function count(status) {
  const row = status
    ? await queryOne('SELECT COUNT(*) AS total FROM listings WHERE status = ?', [status])
    : await queryOne('SELECT COUNT(*) AS total FROM listings');
  return Number(row.total);
}

async function countByCategory() {
  const rows = await query(
    'SELECT category, COUNT(*) AS count FROM listings GROUP BY category ORDER BY count DESC'
  );
  return rows.map((row) => ({ _id: row.category, count: Number(row.count) }));
}

module.exports = {
  toListing,
  findById,
  findMany,
  insertStatement,
  create,
  update,
  setStatusStatement,
  setModeration,
  incrementViews,
  remove,
  count,
  countByCategory,
};

const { query, queryOne } = require('../config/database');
const { newId } = require('./helpers');

const REPORT_SELECT = `
  SELECT r.*,
         rp.name AS reporter_name, rp.email AS reporter_email, rp.role AS reporter_role,
         au.name AS against_name, au.email AS against_email, au.role AS against_role, au.status AS against_status,
         rv.name AS reviewer_name, rv.email AS reviewer_email,
         c.listing_id, l.title AS listing_title,
         c.user_a_id, ua.name AS a_name, ua.email AS a_email, ua.role AS a_role, ua.status AS a_status,
         c.user_b_id, ub.name AS b_name, ub.email AS b_email, ub.role AS b_role, ub.status AS b_status
  FROM reports r
  JOIN users rp ON rp.id = r.reporter_id
  JOIN users au ON au.id = r.against_user_id
  LEFT JOIN users rv ON rv.id = r.reviewed_by
  JOIN conversations c ON c.id = r.conversation_id
  LEFT JOIN listings l ON l.id = c.listing_id
  JOIN users ua ON ua.id = c.user_a_id
  JOIN users ub ON ub.id = c.user_b_id
`;

function toReport(row) {
  if (!row) return null;

  return {
    _id: row.id,
    conversation: {
      _id: row.conversation_id,
      listing: row.listing_title == null ? null : { _id: row.listing_id, title: row.listing_title },
      participants: [
        { _id: row.user_a_id, name: row.a_name, email: row.a_email, role: row.a_role, status: row.a_status },
        { _id: row.user_b_id, name: row.b_name, email: row.b_email, role: row.b_role, status: row.b_status },
      ],
    },
    reporter: { _id: row.reporter_id, name: row.reporter_name, email: row.reporter_email, role: row.reporter_role },
    againstUser: {
      _id: row.against_user_id,
      name: row.against_name,
      email: row.against_email,
      role: row.against_role,
      status: row.against_status,
    },
    reason: row.reason,
    status: row.status,
    actionTaken: row.action_taken,
    adminNote: row.admin_note,
    reviewedBy: row.reviewed_by ? { _id: row.reviewed_by, name: row.reviewer_name, email: row.reviewer_email } : null,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findById(id) {
  return toReport(await queryOne(`${REPORT_SELECT} WHERE r.id = ?`, [id]));
}

async function findMany({ status } = {}) {
  const rows = status
    ? await query(`${REPORT_SELECT} WHERE r.status = ? ORDER BY r.created_at DESC`, [status])
    : await query(`${REPORT_SELECT} ORDER BY r.created_at DESC`);
  return rows.map(toReport);
}

function insertStatement({
  id = newId(),
  conversationId,
  reporterId,
  againstUserId,
  reason,
  status = 'pending',
  actionTaken = 'none',
  adminNote = '',
  reviewedBy = null,
  reviewedAt = null,
  createdAt = new Date(),
  updatedAt = createdAt,
}) {
  return [
    `INSERT INTO reports
       (id, conversation_id, reporter_id, against_user_id, reason, status, action_taken, admin_note,
        reviewed_by, reviewed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      conversationId,
      reporterId,
      againstUserId,
      reason,
      status,
      actionTaken,
      adminNote,
      reviewedBy,
      reviewedAt,
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

function resolveStatement(id, { status, actionTaken, adminNote, reviewedBy }) {
  const now = new Date();
  return [
    `UPDATE reports
     SET status = ?, action_taken = ?, admin_note = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
     WHERE id = ?`,
    [status, actionTaken, adminNote, reviewedBy, now, now, id],
  ];
}

async function countPending() {
  const row = await queryOne("SELECT COUNT(*) AS total FROM reports WHERE status = 'pending'");
  return Number(row.total);
}

module.exports = {
  findById,
  findMany,
  insertStatement,
  create,
  resolveStatement,
  countPending,
};

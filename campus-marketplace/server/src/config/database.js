const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { databaseUrl } = require('./env');

// Keep all database access behind query/queryOne/batch. Spacefast exposes a
// D1-style binding with no interactive transactions, so atomic writes must be
// expressed as a batch of statements with no reads in between.

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      uri: databaseUrl,
      timezone: 'Z',
      decimalNumbers: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function batch(statements) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    for (const [sql, params = []] of statements) {
      await connection.query(sql, params);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function applySchema() {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  const statements = schema
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement && !statement.split('\n').every((line) => line.trim().startsWith('--')));

  for (const statement of statements) {
    await query(statement);
  }
}

async function connectDatabase() {
  await query('SELECT 1');
  await applySchema();
}

async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  connectDatabase,
  closeDatabase,
  query,
  queryOne,
  batch,
};

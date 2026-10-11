const fs = require('fs');
const path = require('path');
const createMysqlDriver = require('../db/mysqlDriver');
const { setDriver, query, applySchema, closeDatabase } = require('./database');
const { databaseUrl } = require('./env');

function readSchema() {
  return fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
}

async function connectDatabase() {
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }
  setDriver(createMysqlDriver(databaseUrl));
  await query('SELECT 1');
  await applySchema(readSchema());
}

module.exports = {
  connectDatabase,
  closeDatabase,
  readSchema,
};

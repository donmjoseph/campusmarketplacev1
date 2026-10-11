// Keep all database access behind query/queryOne/batch. The driver behind them
// is mysql2 locally (src/db/mysqlDriver.js) and Spacefast's env.DB binding when
// deployed (src/db/d1Driver.js). env.DB has no interactive transactions, so
// multi-row writes must be a batch of statements with no reads in between.

let driver = null;

function setDriver(nextDriver) {
  driver = nextDriver;
}

function getDriver() {
  if (!driver) {
    throw new Error('Database driver has not been configured.');
  }
  return driver;
}

async function query(sql, params = []) {
  return getDriver().query(sql, params);
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function batch(statements) {
  if (statements.length) {
    await getDriver().batch(statements.map(([sql, params = []]) => [sql, params]));
  }
}

function splitSchema(schemaSql) {
  return schemaSql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement && !statement.split('\n').every((line) => line.trim().startsWith('--')));
}

async function applySchema(schemaSql) {
  for (const statement of splitSchema(schemaSql)) {
    await query(statement);
  }
}

async function closeDatabase() {
  if (driver?.close) {
    await driver.close();
  }
  driver = null;
}

module.exports = {
  setDriver,
  query,
  queryOne,
  batch,
  splitSchema,
  applySchema,
  closeDatabase,
};

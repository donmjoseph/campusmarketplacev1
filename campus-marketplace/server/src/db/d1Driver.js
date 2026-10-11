// Driver for Spacefast's env.DB binding: a D1-shaped relay to the space's MySQL
// database. Values travel as JSON, so Dates and booleans are flattened on the way
// in and DATETIME strings are turned back into Dates on the way out. The relay
// caps statements per batch and concurrent calls, and a batch is not atomic.

const MAX_BATCH_STATEMENTS = 20;
const MAX_CONCURRENT_CALLS = 4;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z?$/;

function toParam(value) {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 23).replace('T', ' ');
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
}

function fromValue(value) {
  if (typeof value === 'string' && DATETIME_PATTERN.test(value)) {
    return new Date(`${value.replace(' ', 'T').replace(/Z$/, '')}Z`);
  }
  return value;
}

function toRows(result) {
  const rows = Array.isArray(result) ? result : result?.results || [];
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, fromValue(value)])));
}

function createLimiter(limit) {
  let active = 0;
  const waiting = [];

  return async function run(task) {
    if (active >= limit) {
      await new Promise((resolve) => waiting.push(resolve));
    } else {
      active += 1;
    }
    try {
      return await task();
    } finally {
      const next = waiting.shift();
      if (next) next();
      else active -= 1;
    }
  };
}

function createD1Driver(binding) {
  if (!binding?.prepare) {
    throw new Error('Spacefast env.DB binding is not available.');
  }

  const limit = createLimiter(MAX_CONCURRENT_CALLS);
  const prepare = (sql, params) => binding.prepare(sql).bind(...params.map(toParam));

  return {
    async query(sql, params) {
      return toRows(await limit(() => prepare(sql, params).all()));
    },

    async batch(statements) {
      for (let start = 0; start < statements.length; start += MAX_BATCH_STATEMENTS) {
        const chunk = statements.slice(start, start + MAX_BATCH_STATEMENTS);
        await limit(() => binding.batch(chunk.map(([sql, params]) => prepare(sql, params))));
      }
    },
  };
}

module.exports = createD1Driver;

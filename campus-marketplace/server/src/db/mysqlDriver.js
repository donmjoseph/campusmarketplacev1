const mysql = require('mysql2/promise');

function createMysqlDriver(uri) {
  const pool = mysql.createPool({
    uri,
    timezone: 'Z',
    decimalNumbers: true,
    connectionLimit: 10,
  });

  return {
    async query(sql, params) {
      const [rows] = await pool.query(sql, params);
      return rows;
    },

    async batch(statements) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        for (const [sql, params] of statements) {
          await connection.query(sql, params);
        }
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },

    close() {
      return pool.end();
    },
  };
}

module.exports = createMysqlDriver;

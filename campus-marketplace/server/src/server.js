const app = require('./app');
const { connectDatabase } = require('./config/mysql');
const { port } = require('./config/env');

async function start() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

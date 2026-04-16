const mongoose = require('mongoose');
const { mongodbUri, nodeEnv } = require('./env');

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongodbUri, {
    autoIndex: nodeEnv !== 'production',
  });
}

module.exports = connectDatabase;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { clientUrl } = require('./config/env');

const app = express();

const corsOrigin =
  clientUrl ||
  (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173');

app.use(
  cors({
    origin: corsOrigin,
    credentials: corsOrigin !== '*',
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

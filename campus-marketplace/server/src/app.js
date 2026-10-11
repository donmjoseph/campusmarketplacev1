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

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

// Helmet helps secure the app by setting security-related HTTP headers
app.use(helmet());
// Morgan is a middleware that logs the HTTP requests to the console
app.use(morgan('dev'));
// Express.json is a middleware that parses the incoming requests with JSON payloads
app.use(express.json({ limit: '1mb' }));
// Express.urlencoded is a middleware that parses the incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));
// CookieParser is a middleware that parses the cookies attached to the request
app.use(cookieParser());
// This allows all routes to be prefixed with /api
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

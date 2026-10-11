const express = require('express');
const cors = require('cors');
// .default because Spacefast's bundler resolves helmet to its ES module build.
const helmet = require('helmet').default;
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { clientUrl, nodeEnv } = require('./config/env');

// Spacefast workers cannot compile morgan's string formats (no eval), so
// production logs through a plain function instead of 'dev'.
function productionLog(tokens, req, res) {
  return [tokens.method(req, res), tokens.url(req, res), tokens.status(req, res), `${tokens['response-time'](req, res)} ms`].join(' ');
}

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
app.use(morgan(nodeEnv === 'production' ? productionLog : 'dev'));
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

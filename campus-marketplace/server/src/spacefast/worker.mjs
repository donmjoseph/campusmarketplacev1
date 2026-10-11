import { toReqRes, toFetchResponse, FetchIncomingMessage, FetchServerResponse } from 'fetch-to-node';
import database from '../config/database.js';
import createD1Driver from '../db/d1Driver.js';

// Spacefast Functions entry. Spacefast serves the built client files itself and
// only sends this worker the requests no file answers: /api goes to the Express
// app, and anything else gets index.html so client-side routes survive a reload.

function copyStringEnv(env) {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string' && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function loadApp(env, schemaSql) {
  copyStringEnv(env);
  database.setDriver(createD1Driver(env.DB));
  await database.applySchema(schemaSql);
  const { default: app } = await import('../app.js');

  // Express moves every req/res onto its own prototypes, which extend Node's
  // http classes. Rebase those onto fetch-to-node's classes so writes still land
  // in the buffer toFetchResponse turns into the worker's Response.
  Object.setPrototypeOf(Object.getPrototypeOf(app.request), FetchIncomingMessage.prototype);
  Object.setPrototypeOf(Object.getPrototypeOf(app.response), FetchServerResponse.prototype);
  return app;
}

// fetch-to-node requests have no socket, but req.ip (used by morgan) and
// req.protocol read one, so give each request a stand-in.
function attachSocket(req, request, url) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  const socket = {
    remoteAddress: request.headers.get('cf-connecting-ip') || forwardedFor || undefined,
    encrypted: url.protocol === 'https:',
    readable: true,
    writable: true,
  };
  Object.defineProperty(req, 'socket', { value: socket, configurable: true });
  Object.defineProperty(req, 'connection', { value: socket, configurable: true });
}

function isApiPath(pathname) {
  return pathname === '/api' || pathname.startsWith('/api/');
}

export function createWorker({ schemaSql, indexHtml }) {
  let appPromise = null;

  return {
    async fetch(request, env) {
      const url = new URL(request.url);

      if (!isApiPath(url.pathname)) {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          return new Response('Not found', { status: 404 });
        }
        return new Response(indexHtml, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' },
        });
      }

      if (!appPromise) {
        appPromise = loadApp(env, schemaSql).catch((error) => {
          appPromise = null;
          throw error;
        });
      }

      let app;
      try {
        app = await appPromise;
      } catch (error) {
        console.error('Failed to start API:', error);
        return Response.json({ message: 'Server failed to start' }, { status: 500 });
      }

      const { req, res } = toReqRes(request);
      attachSocket(req, request, url);
      app(req, res);
      return toFetchResponse(res);
    },
  };
}

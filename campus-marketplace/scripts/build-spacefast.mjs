// Assembles spacefast-dist/, the folder `sf publish` uploads: the built client
// files plus a pre-bundled worker that runs the Express API (server/src/spacefast).
// Run `npm run build` first so client/dist exists.

import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDist = path.join(root, 'client', 'dist');
const outDir = path.join(root, 'spacefast-dist');
const workerFile = 'spacefast-worker.mjs';

if (!fs.existsSync(path.join(clientDist, 'index.html'))) {
  console.error('client/dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.cpSync(clientDist, outDir, { recursive: true });

const indexHtml = fs.readFileSync(path.join(clientDist, 'index.html'), 'utf8');
const schemaSql = fs.readFileSync(path.join(root, 'server', 'src', 'db', 'schema.sql'), 'utf8');

// Node built-ins stay external as `node:` imports, which the Workers runtime
// provides under nodejs_compat. CommonJS require() calls cannot be left in an
// ES module, so each one is routed through a tiny module that imports it.
const builtins = new Set(builtinModules.filter((name) => !name.startsWith('node:')));
const nodeBuiltins = {
  name: 'node-builtins',
  setup(build) {
    build.onResolve({ filter: /^(?:node:)?[^./]/ }, (args) => {
      const name = args.path.replace(/^node:/, '');
      if (!builtins.has(name.split('/')[0])) return undefined;
      if (args.kind === 'require-call') return { path: `node:${name}`, namespace: 'node-builtin' };
      return { path: `node:${name}`, external: true };
    });
    build.onLoad({ filter: /.*/, namespace: 'node-builtin' }, (args) => ({
      contents: `import builtin from ${JSON.stringify(args.path)}; module.exports = builtin;`,
      loader: 'js',
    }));
  },
};

// Spacefast bundles the worker again on publish, but its resolver picks a
// package's ES module build even for require(), which breaks CommonJS packages
// such as Express's router. Bundling here first leaves it nothing to resolve.
await esbuild.build({
  stdin: {
    contents: `import { createWorker } from './worker.mjs';
export default createWorker({
  indexHtml: ${JSON.stringify(indexHtml)},
  schemaSql: ${JSON.stringify(schemaSql)},
});
`,
    resolveDir: path.join(root, 'server', 'src', 'spacefast'),
    sourcefile: workerFile,
    loader: 'js',
  },
  outfile: path.join(outDir, workerFile),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  conditions: ['workerd', 'worker'],
  plugins: [nodeBuiltins],
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none',
  logLevel: 'warning',
});

// Spacefast only enables Node built-ins for a worker declared through a
// Wrangler config with the nodejs_compat flag.
fs.writeFileSync(
  path.join(outDir, 'wrangler.jsonc'),
  `${JSON.stringify(
    {
      main: workerFile,
      compatibility_date: '2026-07-01',
      compatibility_flags: ['nodejs_compat'],
    },
    null,
    2
  )}\n`
);

fs.writeFileSync(
  path.join(outDir, 'sf.jsonc'),
  `${JSON.stringify(
    {
      $schema: 'https://spacefast.com/schemas/sf.json',
      name: 'campus-marketplace',
      runtime: { kind: 'functions' },
    },
    null,
    2
  )}\n`
);

console.log(`Built ${path.relative(root, outDir)}/. Publish with: npm run spacefast:publish`);

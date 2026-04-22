const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const CONTAINER_NAME = 'campus-marketplace-mongodb';
const ARCHIVE_NAME = 'campus_marketplace.archive.gz';
const CONTAINER_ARCHIVE_PATH = `/tmp/${ARCHIVE_NAME}`;

const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'database-dump');
const outputArchivePath = path.join(outputDir, ARCHIVE_NAME);

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

function assertMongoContainerRunning() {
  const running = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);

  if (!running.includes(CONTAINER_NAME)) {
    throw new Error(
      `Container "${CONTAINER_NAME}" is not running. Start it first with "docker compose up -d mongodb".`
    );
  }
}

function main() {
  assertMongoContainerRunning();
  fs.mkdirSync(outputDir, { recursive: true });

  run(
    `docker exec ${CONTAINER_NAME} sh -lc "mongodump --db campus_marketplace --archive=${CONTAINER_ARCHIVE_PATH} --gzip"`
  );
  run(`docker cp ${CONTAINER_NAME}:${CONTAINER_ARCHIVE_PATH} "${outputArchivePath}"`);
  run(`docker exec ${CONTAINER_NAME} sh -lc "rm -f ${CONTAINER_ARCHIVE_PATH}"`);

  console.log(`\nMongoDB dump created at:\n${outputArchivePath}\n`);
}

try {
  main();
} catch (error) {
  console.error('\nFailed to create MongoDB dump.');
  console.error(error.message);
  process.exit(1);
}

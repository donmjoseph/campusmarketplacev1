const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const CONTAINER_NAME = 'campus-marketplace-mongodb';
const ARCHIVE_NAME = 'campus_marketplace.archive.gz';
const CONTAINER_ARCHIVE_PATH = `/tmp/${ARCHIVE_NAME}`;

const repoRoot = path.resolve(__dirname, '..');
const defaultArchivePath = path.join(repoRoot, 'database-dump', ARCHIVE_NAME);

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
  const archiveArg = process.argv[2];
  const archivePath = archiveArg ? path.resolve(archiveArg) : defaultArchivePath;

  if (!fs.existsSync(archivePath)) {
    throw new Error(
      `Dump archive not found at "${archivePath}". Run "npm run db:dump" first or pass a file path.`
    );
  }

  assertMongoContainerRunning();

  run(`docker cp "${archivePath}" ${CONTAINER_NAME}:${CONTAINER_ARCHIVE_PATH}`);
  run(
    `docker exec ${CONTAINER_NAME} sh -lc "mongorestore --drop --archive=${CONTAINER_ARCHIVE_PATH} --gzip --nsInclude='campus_marketplace.*'"`
  );
  run(`docker exec ${CONTAINER_NAME} sh -lc "rm -f ${CONTAINER_ARCHIVE_PATH}"`);

  console.log('\nMongoDB dump restored into database "campus_marketplace".\n');
}

try {
  main();
} catch (error) {
  console.error('\nFailed to restore MongoDB dump.');
  console.error(error.message);
  process.exit(1);
}

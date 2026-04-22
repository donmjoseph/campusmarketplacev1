# WSU Campus Marketplace

Full-stack marketplace app for WSU students.

## This zip includes:

- Full source code
- `README.md` setup instructions
- MongoDB dump: `database-dump/campus_marketplace.archive.gz`

## Fastest Setup (Docker, Recommended)

This is the shortest path to run the full app (client + server + MongoDB).

### Prerequisite

- Docker Desktop

### Commands

```bash
# from campus-marketplace/
docker compose up -d --build
docker compose run --rm seeder
```

### URLs

- App: `http://localhost:3000`
- API health: `http://localhost:5001/api/health`

### Stop Services

```bash
docker compose down
```

## Demo Accounts

All buyer/seller accounts use `password123`.  
All admin accounts use `admin123`.

| Role | Email |
| --- | --- |
| Buyer | `buyer1@wsu.edu` |
| Buyer | `buyer2@wsu.edu` |
| Seller | `seller1@wsu.edu` |
| Seller | `seller2@wsu.edu` |
| Admin | `admin1@wsu.edu` |
| Admin | `admin2@wsu.edu` |
| Admin | `admin3@wsu.edu` |

## Local Setup (Fallback, No Docker Client/Server)

Use this only if Docker is not available for the full stack.

### Prerequisites

- Node.js 18+
- npm
- MongoDB running locally, or run only MongoDB in Docker with `npm run db:up`

### Commands

```bash
# from campus-marketplace/
npm install
npm install --prefix server
npm install --prefix client
```

Copy env file:

```powershell
Copy-Item server/.env.example server/.env
```

```bash
cp server/.env.example server/.env
```

Then run:

```bash
npm run seed
npm run dev
```

- Frontend: `http://localhost:5173`
- API health: `http://localhost:5001/api/health`

## MongoDB Dump

`mongodump` exports MongoDB data into a portable backup file.  
If your professor asks for a Mongo export, use:

```bash
# make sure MongoDB container is running first
docker compose up -d mongodb
npm run db:dump
```

This creates:

- `database-dump/campus_marketplace.archive.gz`

To restore that dump later:

```bash
docker compose up -d mongodb
npm run db:restore
```

## Useful Scripts (repo root)

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start server + client locally |
| `npm run seed` | Reseed database with demo data |
| `npm run db:up` | Start MongoDB container only |
| `npm run db:down` | Stop Docker Compose services |
| `npm run db:dump` | Export MongoDB dump archive |
| `npm run db:restore` | Restore MongoDB dump archive |
| `npm run lint` | Lint client + server |
| `npm run build` | Build client production assets |
| `npm run zip:submission` | Build clean submission zip |

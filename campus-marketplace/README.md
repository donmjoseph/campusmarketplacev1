# WSU Campus Marketplace

A full-stack marketplace for Washington State University students to buy, sell, and connect safely on campus.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (7-day expiry) |
| Styling | Custom `cm-*` design system (WSU crimson `#981e32`) |

## Features

### Buyer
- Register/login with WSU email (`@wsu.edu`, `@email.wsu.edu`, `@vet.wsu.edu`)
- Browse and filter listings by category, condition, and price
- Add items to cart and checkout (pickup or shipping)
- Order history with cancellation requests
- Profile management
- Messaging with sellers + report conversations

### Seller
- Dashboard with revenue, active listings, and pending order stats
- Create, edit, and delete listings across 6 categories
- Confirm and fulfill orders; approve/deny cancellation requests
- Messaging center

### Admin
- Dashboard with platform-wide stats and recent activity
- Manage users: suspend and reinstate accounts
- Moderate listings: remove and restore
- View all orders with full buyer/seller/item detail
- Analytics: revenue over time, new users, orders by status, top listings (recharts)
- Reports: dismiss, warn, or suspend reported users

---

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB** — local install *or* Docker Desktop

---

## Quick Start (without Docker)

```bash
# 1. From the repo root, enter the project
cd campus-marketplace

# 2. Install root dev dependencies (concurrently)
npm install

# 3. Set up the server
cd server
npm install
cp .env.example .env      # edit JWT_SECRET before deploying
cd ..

# 4. Install client dependencies
cd client && npm install && cd ..

# 5. Seed the database with demo data
npm run seed

# 6. Start both server and client
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## Quick Start (with Docker)

Builds and runs MongoDB + the Express API + the Nginx-served React app.

```bash
cd campus-marketplace

# 1. Build images and start all three services
docker compose up --build

# 2. In a second terminal, seed demo accounts and listings (first time only)
docker compose run --rm seeder
```

- App: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:5001/api/health](http://localhost:5001/api/health)

The server waits for MongoDB to pass its healthcheck before starting, so startup order is guaranteed. The `seeder` service drops and recreates all demo data each time it runs — only run it once unless you want to reset.

On subsequent starts you can skip the seed step:

```bash
docker compose up
```

---

## Environment Variables (`server/.env`)

Copy `server/.env.example` to `server/.env` and fill in values before running.

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/campus_marketplace` | MongoDB connection string |
| `JWT_SECRET` | *(required)* | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `PORT` | `5001` | Express server port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | `development` | `development` or `production` |

---

## Demo Accounts

All accounts use **`password123`** except admins which use **`admin123`**.

| Role | Email | Password |
|------|-------|----------|
| Buyer | `buyer1@wsu.edu` | `password123` |
| Buyer | `buyer2@wsu.edu` | `password123` |
| Seller | `seller1@wsu.edu` | `password123` |
| Seller | `seller2@wsu.edu` | `password123` |
| Admin | `admin1@wsu.edu` | `admin123` |
| Admin | `admin2@wsu.edu` | `admin123` |
| Admin | `admin3@wsu.edu` | `admin123` |

---

## Project Structure

```
campus-marketplace/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Shared components (layout, EmptyState, etc.)
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── pages/           # Route-level page components
│   │   │   ├── admin/       # Admin portal pages
│   │   │   └── seller/      # Seller portal pages
│   │   ├── styles/          # legacy.css (cm-* design system)
│   │   └── utils/           # format, errors, usePageTitle
│   ├── Dockerfile
│   └── nginx.conf           # Production nginx config (proxies /api → server)
│
├── server/                  # Express API
│   ├── src/
│   │   ├── config/          # env, database
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # auth, validate, asyncHandler
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routers
│   │   ├── scripts/         # seedData.js
│   │   └── utils/           # AppError, asyncHandler
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml       # MongoDB + server + client services
├── package.json             # Root scripts (dev, seed, build, lint)
└── README.md
```

---

## Useful Scripts (run from `campus-marketplace/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server + client concurrently |
| `npm run dev:server` | API server only |
| `npm run dev:client` | Vite dev server only |
| `npm run seed` | Drop and reseed the database |
| `npm run build` | Production build of the client |
| `npm run db:up` | Start only the MongoDB Docker container |
| `npm run db:down` | Stop Docker containers |
| `npm run lint` | Lint client and server |

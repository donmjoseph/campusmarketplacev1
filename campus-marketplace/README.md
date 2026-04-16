# Campus Marketplace (MERN Rewrite)

Full-stack Campus Marketplace application for WSU with **Buyer**, **Seller**, and **Admin** roles.

- Frontend: React + Vite + Tailwind + legacy `cm-` styles
- Backend: Node.js + Express + Mongoose + JWT auth
- Database: MongoDB (local instance or Docker)

This project replaces the original static HTML mockup with a fully functional MERN implementation.

## Features

### Buyer
- Register/Login with WSU email validation
- Browse/search/filter listings
- Product detail page
- Add/remove cart items
- Checkout with pickup/shipping
- Order history + cancellation request
- Profile management
- Messaging with sellers + report conversation

### Seller
- Seller dashboard with stats
- Create/edit/deactivate listings
- View seller orders
- Mark order fulfilled
- Approve/deny cancellation requests
- Access conversation center

### Admin
- Admin dashboard stats
- Manage users (suspend/reinstate)
- Moderate listings (remove/restore)
- View all orders
- Analytics (KPIs + category/month breakdown)
- Review reports (dismiss/warn/suspend)

## Project Structure

```text
campus-marketplace/
  client/                 # React frontend
  server/                 # Express API + Mongo models
  docker-compose.yml      # Optional MongoDB container
  package.json            # Root scripts for full-stack dev
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB running locally on `127.0.0.1:27017`
  - Option A: local MongoDB install
  - Option B: Docker (`docker compose up -d mongodb`)

## Quick Start

1. Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

2. Start MongoDB:

```bash
npm run db:up
```

3. Seed demo data:

```bash
npm run seed
```

4. Start backend + frontend:

```bash
npm run dev
```

5. Open:
- Frontend: `http://localhost:5173`
- API health: `http://localhost:5000/api/health`

## Demo Credentials

- Buyer: `buyer@wsu.edu` / `password123`
- Seller: `alex@wsu.edu` / `password123`
- Admin: `admin@wsu.edu` / `admin123`

## Environment Variables

`server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/campus_marketplace
JWT_SECRET=super-secret-change-me
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Useful Scripts

Root:
- `npm run dev` - run server + client together
- `npm run dev:server` - run API only
- `npm run dev:client` - run frontend only
- `npm run seed` - seed demo data
- `npm run build` - production frontend build
- `npm run lint` - lint both apps
- `npm run db:up` - start MongoDB container
- `npm run db:down` - stop MongoDB container

## Notes

- Existing static HTML files remain in the repository for reference, but the runnable app is now the MERN stack in `client/` and `server/`.
- If MongoDB is not running, API startup/seed will fail with `ECONNREFUSED 127.0.0.1:27017`.

# Admin Data Flow Study Guide

This guide explains the admin section of the Campus Marketplace app from the React UI down to Express controllers and MongoDB documents.

## 1. Dashboard Request Trace

Use `/admin/dashboard` as the baseline flow. If you can explain this, the rest of the admin portal follows the same pattern.

1. The admin logs in through the normal auth flow.
2. `server/src/controllers/authController.js` verifies the email/password, blocks suspended users, and returns a JWT plus a public user object.
3. `client/src/context/AuthContext.jsx` stores the JWT in `localStorage`, stores the user in React state, and calls `setAuthToken`.
4. `client/src/api/http.js` adds `Authorization: Bearer <token>` to future Axios requests.
5. `client/src/App.jsx` defines the `/admin` route and wraps it with `ProtectedRoute allowRoles={['admin']}`.
6. `client/src/components/ProtectedRoute.jsx` checks three things:
   - auth is done booting
   - the user is authenticated
   - the user role is allowed
7. `client/src/components/layout/DashboardLayout.jsx` renders the admin sidebar and an `<Outlet />` where the current admin page appears.
8. `client/src/pages/admin/AdminDashboardPage.jsx` runs a `useEffect` on page load and calls `http.get('/admin/dashboard')`.
9. The browser sends `GET /api/admin/dashboard` because Axios uses `/api` as the base URL.
10. `server/src/app.js` mounts all API routes under `/api`.
11. `server/src/routes/index.js` mounts admin routes under `/admin`.
12. `server/src/routes/adminRoutes.js` applies `requireAuth` and `requireRole('admin')` before any admin controller runs.
13. `server/src/middleware/auth.js` verifies the JWT, loads the `User` from MongoDB, blocks suspended users, and attaches `req.user`.
14. `adminController.getDashboard` runs several Mongo queries in parallel:
    - total users
    - active listings
    - total orders
    - pending reports
    - recent users
    - recent orders
15. The controller returns JSON.
16. `AdminDashboardPage` stores that JSON in React state and renders stat cards plus recent user/order tables.

Short interview version:

> The admin dashboard is a protected React route. The frontend checks that the logged-in user has the admin role, then calls `/admin/dashboard` through a shared Axios client that includes the JWT. The Express admin router verifies the token again, enforces the admin role server-side, and the dashboard controller queries MongoDB for counts and recent records. The response is stored in React state and rendered as dashboard cards and tables.

## 2. Admin Route Map

| UI Route | React Component | API Call | Backend Controller | Main Models |
| --- | --- | --- | --- | --- |
| `/admin/dashboard` | `AdminDashboardPage.jsx` | `GET /admin/dashboard` | `getDashboard` | `User`, `Listing`, `Order`, `Report` |
| `/admin/users` | `AdminUsersPage.jsx` | `GET /admin/users` | `getUsers` | `User` |
| `/admin/users` | `AdminUsersPage.jsx` | `PATCH /admin/users/:id/status` | `updateUserStatus` | `User` |
| `/admin/listings` | `AdminListingsPage.jsx` | `GET /admin/listings` | `getListings` | `Listing`, `User` via `seller` populate |
| `/admin/listings` | `AdminListingsPage.jsx` | `PATCH /admin/listings/:id/moderate` | `moderateListing` | `Listing` |
| `/admin/orders` | `AdminOrdersPage.jsx` | `GET /admin/orders` | `getOrders` | `Order`, populated `buyer`, `seller`, `listing` |
| `/admin/analytics` | `AdminAnalyticsPage.jsx` | `GET /admin/analytics` | `getAnalytics` | `User`, `Listing`, `Order` |
| `/admin/reports` | `AdminReportsPage.jsx` | `GET /admin/reports` | `getReports` | `Report`, `Conversation`, `User` |
| `/admin/reports` | `AdminReportsPage.jsx` | `PATCH /admin/reports/:id/resolve` | `resolveReport` | `Report`, possibly `User` |

Common page pattern:

1. Component owns local state like filters, loading flags, and fetched rows.
2. `useEffect` loads data on mount or when filters change.
3. The page builds query params with `URLSearchParams` when needed.
4. It calls the API through `http`.
5. Errors are shown with `showToast(getErrorMessage(...))`.
6. Tables, cards, or charts render from React state.

## 3. Practice Action Flows

### Suspend Or Reinstate A User

Frontend:

1. In `AdminUsersPage.jsx`, the table shows a Suspend or Reinstate button based on `user.status`.
2. Suspending prompts for a reason.
3. The page sends `PATCH /admin/users/:id/status` with:

```json
{
  "status": "suspended",
  "suspensionReason": "Reason typed by admin"
}
```

Backend:

1. `adminRoutes.js` validates that `:id` is a Mongo ID and `status` is either `active` or `suspended`.
2. `requireAuth` verifies the JWT and loads the current user.
3. `requireRole('admin')` rejects non-admin users.
4. `updateUserStatus` finds the target user.
5. It prevents suspending another admin account through this route.
6. It updates `user.status` and `user.suspensionReason`, then saves.
7. A suspended user is blocked later by both login logic and `requireAuth`.

Interview phrasing:

> User suspension is a PATCH flow. The admin page sends the target status and reason, the route validates the input, and the controller updates the target `User` document. Suspension has real auth impact because login and authenticated middleware both block suspended users.

### Remove Or Restore A Listing

Frontend:

1. `AdminListingsPage.jsx` displays listings with filters for search, category, and status.
2. Clicking Remove prompts for a reason.
3. The page sends `PATCH /admin/listings/:id/moderate` with:

```json
{
  "action": "remove",
  "reason": "Reason typed by admin"
}
```

Backend:

1. The route validates `:id`, `action`, and optional `reason`.
2. `moderateListing` finds the listing.
3. For `remove`, it sets:
   - `status = 'removed'`
   - `removedReason = reason`
   - `removedBy = req.user._id`
   - `removedAt = new Date()`
4. For `restore`, it sets:
   - `status = 'active'`
   - clears removal reason, admin ID, and timestamp
5. The frontend reloads the listing table.

Interview phrasing:

> Listing moderation changes both the visible status and audit metadata. Removing a listing marks it as removed and records who removed it and why. Restoring clears those fields and makes the listing active again.

### Resolve A Report

Frontend:

1. `AdminReportsPage.jsx` loads reports and lets admins filter by status.
2. The admin chooses Dismiss, Warn, or Suspend.
3. The page sends `PATCH /admin/reports/:id/resolve` with:

```json
{
  "action": "suspend",
  "note": "Optional admin note"
}
```

Backend:

1. The route validates the report ID and action.
2. `resolveReport` finds the report and populates `againstUser`.
3. It records review metadata:
   - `reviewedBy`
   - `reviewedAt`
   - `adminNote`
4. For `dismiss`, it marks the report as dismissed.
5. For `warn`, it marks the report as reviewed and action taken as warned.
6. For `suspend`, it marks the report reviewed and also updates the reported user's `status` and `suspensionReason`.
7. It saves the affected documents.

Interview phrasing:

> Report resolution can update more than one document. The report always gets review metadata, and if the admin chooses suspend, the reported user's account is suspended too.

## 4. Analytics Flow

`AdminAnalyticsPage.jsx` calls `GET /admin/analytics` once and renders the result with Recharts.

The controller mixes simple counts and aggregation pipelines:

- `countDocuments()` answers direct totals like total users or total orders.
- `aggregate()` groups records, such as revenue by day, orders by status, users by day, and top listings.
- `priceSnapshot` is used for revenue so analytics reflect the order price at checkout time instead of relying on a listing price that may have changed later.

Interview phrasing:

> The analytics endpoint is server-driven. The frontend only renders charts, while the backend computes metrics with Mongoose counts and Mongo aggregation pipelines. That keeps the data logic centralized and avoids sending unnecessary raw records to the client.

## 5. Security And Authorization Talking Points

The admin system has two layers of protection:

1. Frontend protection in `ProtectedRoute`.
2. Backend protection in `requireAuth` and `requireRole('admin')`.

The backend layer is the important security boundary. Frontend route checks improve UX, but users can still manually call APIs. The Express middleware protects the actual data and actions.

JWT lifecycle:

1. Login returns a signed token containing `userId` and `role`.
2. React stores the token in `localStorage`.
3. Axios sends the token in the `Authorization` header.
4. Express verifies the token using the server secret.
5. The backend loads the user from MongoDB instead of blindly trusting the frontend.

## 6. React Concepts Used In Admin

Focus on these because they are the concepts this app actually uses:

- `useState`: stores fetched data, filters, and loading flags.
- `useEffect`: triggers API calls on page load or filter changes.
- Context: `AuthContext` makes auth state available across the app.
- React Router: nested routes, `Navigate`, `Outlet`, and `NavLink`.
- Controlled inputs: filter form values are stored in component state.
- Conditional rendering: loading text, empty rows, action buttons, and chart fallbacks.

## 7. Backend Concepts Used In Admin

Focus on these:

- Express route mounting: `/api` then `/admin`.
- Middleware order: auth and role checks run before controllers.
- Validation: `express-validator` rejects invalid IDs and unsupported actions.
- Mongoose reads: `find`, `findById`, `countDocuments`.
- Mongoose relationships: `populate` replaces referenced IDs with useful user/listing data.
- Mongoose writes: mutate document fields and call `save`.
- Aggregation: group and summarize data for analytics.

## 8. Interview Script

### Access Control

> The admin portal is protected in two layers. On the frontend, React Router wraps `/admin` routes in `ProtectedRoute` and checks the authenticated user's role. On the backend, every `/api/admin` endpoint is guarded by JWT authentication and `requireRole('admin')`, so bypassing the UI still does not grant access.

### Data Loading

> Each admin page owns its own filters and loading state. When the page mounts or filters change, it calls a matching admin API endpoint through a shared Axios client. Axios attaches the JWT, Express verifies it, the controller queries MongoDB, and the returned JSON becomes React state for the table, card, or chart UI.

### Moderation Updates

> Admin actions use PATCH endpoints because they change existing resources. The frontend sends the action details, the backend validates the request and checks admin permissions, then the controller updates the relevant Mongoose document. Some actions, like report suspension, update both the report and the reported user's account.

### Resume Bullet You Can Defend

> Built an admin portal for a MERN-style campus marketplace with protected admin routing, JWT-backed role authorization, user and listing moderation, report resolution workflows, and analytics powered by Mongoose queries and MongoDB aggregation pipelines.

## 9. Self-Test Questions

Use these to check whether you really understand the flow:

1. What prevents a buyer from opening `/admin/users` in the browser?
2. What prevents that same buyer from calling `GET /api/admin/users` directly?
3. Where is the JWT stored on the frontend?
4. How does the JWT get attached to admin requests?
5. Why does the backend call `User.findById` after verifying the token?
6. What is the difference between `GET /admin/users` and `PATCH /admin/users/:id/status`?
7. What listing fields change when an admin removes a listing?
8. Why does report suspension update both `Report` and `User`?
9. What does `populate` do in the admin order/report endpoints?
10. Why are analytics calculated on the backend instead of in React?

# Campus Marketplace

A static HTML/CSS/JS mockup of a peer-to-peer marketplace for Washington State University students. Built for CPTS 489 — covers all Buyer, Seller, and Admin use cases from the requirements specification.

---

## How to Run

No build tools, no dependencies, no server configuration required. This is a plain static site.

### Option 1 — Open directly in browser (simplest)

```bash
open campus-marketplace/index.html
```

Or double-click `index.html` in Finder. All pages work this way since there are no server-side calls.

### Option 2 — Local HTTP server (recommended, avoids any browser file:// restrictions)

**Using Python (built into macOS):**
```bash
cd campus-marketplace
python3 -m http.server 8080
```
Then open: http://localhost:8080

**Using Node.js `npx serve`:**
```bash
cd campus-marketplace
npx serve .
```
Then open the URL shown in the terminal (usually http://localhost:3000).

**Using VS Code Live Server extension:**
Right-click `index.html` → "Open with Live Server"

---

## Demo Credentials

| Role   | Email             | Password   | Entry Point              |
|--------|-------------------|------------|--------------------------|
| Buyer  | any `@wsu.edu`    | any        | `login.html`             |
| Seller | `alex@wsu.edu`    | any        | `login.html` → redirects to seller dashboard |
| Admin  | `admin@wsu.edu`   | `admin123` | `admin/login.html`       |

> Authentication is simulated client-side. No real credentials are stored or transmitted.

---

## Project Structure

```
campus-marketplace/
├── assets/
│   ├── css/styles.css          # Shared WSU-themed stylesheet (cm- prefix classes)
│   └── js/app.js               # Shared JS: Cart, Toast, Modal, Validator, form handlers
│
├── index.html                  # Home / Landing Page
├── register.html               # UC-B01 · Register
├── login.html                  # UC-B02 · Login
├── browse.html                 # UC-B03 · Browse & Search
├── product.html                # UC-B04 · Product Detail
├── cart.html                   # UC-B05 · Cart
├── checkout.html               # UC-B06 · Checkout
├── order-confirmation.html     # UC-B06 · Order Confirmation
├── orders.html                 # UC-B07 · Order History  /  UC-B10 · Cancel Request
├── profile.html                # UC-B08 · Manage Profile
├── messages.html               # UC-B09 · Messaging
│
├── seller/
│   ├── dashboard.html          # UC-S04–S08 · Seller Dashboard (tabbed)
│   ├── listing-create.html     # UC-S01 · Create Listing
│   └── listing-edit.html       # UC-S02 · Edit  /  UC-S03 · Delete/Deactivate
│
├── admin/
│   ├── login.html              # UC-A01 · Admin Login
│   ├── dashboard.html          # UC-A02 · Admin Dashboard
│   ├── users.html              # UC-A03 · Manage Users
│   ├── listings.html           # UC-A04 · Manage Listings
│   ├── orders.html             # UC-A05 · All Orders
│   ├── analytics.html          # UC-A06 · Platform Analytics
│   └── reported-messages.html  # UC-A07 · Reported Messages
│
├── docs/
│   └── use-case-mapping.md     # UC → page table, web flow diagram, flow details
│
└── README.md                   # This file
```

---

## Use Cases Covered

### Buyer (UC-B01 – UC-B10)
- **B01 Register** — WSU email validation, password policy, duplicate detection
- **B02 Login** — Forgot password modal, suspended account state
- **B03 Browse & Search** — Keyword search, category/condition/price/course filters
- **B04 View Product** — Gallery, seller info, condition/status badges
- **B05 Cart** — Add to cart, remove, race-condition and own-listing alerts
- **B06 Checkout** — Pickup vs shipping, order ID generation, cart cleared on confirm
- **B07 Order History** — Status badges, order detail modal
- **B08 Manage Profile** — Edit info, change password, notification preferences
- **B09 Messaging** — Conversation list, chat thread, send/receive, report conversation
- **B10 Cancel Request** — Cancel modal with reason, duplicate request blocked

### Seller (UC-S01 – UC-S08)
- **S01 Create Listing** — Photo upload with validation, publish or save as draft
- **S02 Edit Listing** — Pre-populated form, update any field, status radio buttons
- **S03 Delete/Deactivate** — Soft deactivate modal or permanent delete modal
- **S04 Seller Dashboard** — Stats, recent orders, tabbed navigation
- **S05 View Orders** — Orders tab with full order table
- **S06 Mark Fulfilled** — Confirm modal before status update
- **S07 Respond to Messages** — Messages tab with full chat UI
- **S08 Approve/Deny Cancellation** — Highlighted cancel-req rows, review modal

### Admin (UC-A01 – UC-A07)
- **A01 Admin Login** — Separate dark-theme portal, lockout after 5 attempts
- **A02 Admin Dashboard** — Platform stats, recent registrations, recent orders, pending reports
- **A03 Manage Users** — Search/filter, suspend with reason, reinstate
- **A04 Manage Listings** — Filter by status/category, remove with reason, restore
- **A05 All Orders** — Platform-wide order table with search and status filter
- **A06 Analytics** — KPIs, CSS bar charts (by category, by month), date range filter
- **A07 Reported Messages** — Report cards with conversation preview, Dismiss/Warn/Suspend actions

---

## Design System

Pages are styled with a custom `cm-` (Campus Marketplace) CSS design system built on WSU Web Design System tokens:

- **Primary color:** WSU Crimson `#CA1237`
- **Font:** Montserrat (Google Fonts), weights 300–800
- **Layout:** CSS Grid for dashboard/sidebar layouts, flexbox for components
- **Components:** buttons, badges, alerts, modals, toasts, tabs, tables, stat cards, bar charts, chat UI, forms

No external CSS frameworks (Bootstrap, Tailwind, etc.) are used — only `normalize.css` for resets.

---

## Technical Notes

- **No backend** — all data is hardcoded HTML; form submissions are simulated with toast notifications
- **Cart** — persisted to `sessionStorage` for the duration of a browser session
- **Modals** — toggled via `.cm-overlay.open` CSS class; backdrop click closes
- **Tabs** — driven by `data-tab-group` / `data-tab` / `data-tab-content` HTML attributes
- **Form validation** — `Validator` object in `app.js` with rules: `required`, `email`, `wsuEmail`, `minLen`, `positiveNum`, `match`
- **Admin lockout** — JS counter (`adminAttempts`) resets on page reload (demo only)

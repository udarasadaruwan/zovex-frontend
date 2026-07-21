# Zovex Frontend

Zovex is a role-based MERN ecommerce frontend built with React, TypeScript, and Vite. It supports customers, sellers, and administrators with a polished shopping flow, responsive dashboards, Stripe checkout handoff, Google authentication, profile management, reviews, cart feedback, and deployment-ready GitHub Pages routing.

## Project Snapshot

| Area | Details |
| --- | --- |
| Type | Ecommerce marketplace frontend |
| Stack | React 19, TypeScript, Vite, React Router, Lucide React |
| Backend | Express + MongoDB API |
| Deployment | GitHub Pages |
| Main users | Customers, sellers, admins |

## 🔗 Live Links

- 🖥️ **Live Link:** [zovex live](https://udarasadaruwan.github.io/zovex-frontend/)
- ⚙️ **Backend Repository:** [zovex Backend](https://github.com/udarasadaruwan/zovex-backend)

## What This Project Demonstrates

- Full ecommerce UI with product browsing, product details, cart, checkout, and order success states.
- Role-aware navigation and dashboards for `user`, `seller`, and `admin`.
- Production SPA deployment on GitHub Pages with correct Vite base path and fallback routing.
- API integration with JWT bearer tokens and cookie-compatible requests.
- Responsive interface design with mobile navigation, dashboard layouts, and touch-friendly controls.
- User feedback patterns: loading states, success popups, action confirmations, disabled buttons during requests, and smooth transitions.

## Key Features

### Customer Experience

- Product catalog and product detail pages
- Cart management with per-user local cart isolation
- Animated add-to-cart confirmation
- Checkout flow with Stripe redirect support
- Payment success page with animated confirmation
- Order history dashboard with order progress and cart snapshot
- Profile settings with phone, address, avatar, and password update flows
- Product reviews and ratings

### Seller Experience

- Seller dashboard with catalog insights
- Product creation form with image upload
- Product list management
- Recent orders and reviews
- Fulfillment status controls for seller product orders
- Success feedback after product creation

### Admin Experience

- Admin dashboard with platform metrics
- User role management
- Category creation and removal
- Recent order and review visibility
- Catalog health and role mix visual summaries
- Loading/disabled states for admin actions to prevent duplicate submissions

## Tech Stack

| Purpose | Technology |
| --- | --- |
| UI | React |
| Language | TypeScript |
| Build tool | Vite |
| Routing | React Router |
| Icons | Lucide React |
| Styling | CSS with responsive layouts and reusable utility classes |
| Deployment | GitHub Pages via `gh-pages` |

## Project Structure

```text
src/
  components/          Shared layout, navbar, buttons, product cards, feedback UI
  components/ui/       Reusable form and button primitives
  context/             Auth and cart state providers
  pages/               Public pages, auth pages, checkout, profile, dashboards
  pages/dashboard/     User, seller, and admin dashboard experiences
  services/            API clients for auth, products, orders, users, reviews
  assets/              Static frontend assets
  styles.css           Global responsive design system
```

## Environment Variables

Create `.env` in the frontend root:

```env
VITE_API_URL=http://localhost:5000/api
```

For deployed GitHub Pages:

```env
VITE_API_URL=https://zovex-backend.onrender.com/api
```

Only variables prefixed with `VITE_` are exposed to the browser. Never put backend secrets, API secrets, Gmail tokens, Stripe secrets, MongoDB credentials, or JWT secrets in the frontend.

## Local Development

```bash
npm install
npm run dev
```

Default local URL:

```text
http://localhost:5173/zovex-frontend/
```

## Production Build

```bash
npm run build
```

The build creates:

```text
dist/
```

The build also runs `scripts/create-spa-fallback.mjs`, which creates a `404.html` fallback for GitHub Pages SPA routing.

## Deployment

```bash
npm run deploy
```

Deployment uses:

```json
"deploy": "gh-pages -d dist"
```

The Vite base path is configured in `vite.config.ts`:

```ts
base: "/zovex-frontend/"
```

This is required because the app is deployed under a GitHub Pages repository path instead of a root domain.

## Important Workflows

### Authentication

- Local email/password login and registration use backend auth endpoints.
- Google OAuth redirects through the backend.
- Auth tokens are stored locally and sent as `Authorization: Bearer <token>`.

### Cart

- Guest cart and authenticated user carts are stored separately.
- Logged-in users do not inherit another user's cart from the same browser.
- Cart updates are immediate and persisted locally.

### Checkout

- The frontend creates an order first.
- The backend creates a Stripe Checkout session.
- The frontend confirms checkout success using the returned Stripe session ID.
- Cart is cleared only after successful payment confirmation.

### Dashboards

- `/dashboard` redirects users to the correct role dashboard.
- `/dashboard/user` focuses on order progress, cart state, and profile readiness.
- `/dashboard/seller` focuses on product creation, catalog, orders, reviews, and fulfillment updates.
- `/dashboard/admin` focuses on users, roles, categories, orders, reviews, and analytics.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check, build, and create GitHub Pages fallback |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Deploy `dist` to GitHub Pages |

## Quality Notes

- Buttons show loading states during async work to prevent duplicate clicks.
- Mobile navigation uses a responsive hamburger panel.
- Dashboard panels stack on small screens.
- Payment, cart, auth, and product creation flows provide visible feedback.
- Routes are protected by role-specific wrappers.

## Interview Talking Points

- Why GitHub Pages requires Vite `base` and SPA fallback handling.
- How role-based dashboards are split without duplicating the entire layout.
- How per-user cart storage prevents cross-account cart leakage in a shared browser.
- How sellers can update fulfillment progress while backend ownership checks protect other sellers' orders.
- How frontend feedback patterns improve trust during slow Render/free-tier requests.
- How checkout avoids clearing the cart until Stripe payment is confirmed.

## Related Repository

Backend API: `zovex-backend`

## License

This project is private and currently has no public license.

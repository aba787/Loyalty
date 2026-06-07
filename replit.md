# LoyalPro — Loyalty & Referral System

A full-stack web app for managing customer loyalty points, membership tiers, referral codes, and commissions. Includes an admin dashboard and a customer self-service portal.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied to /api)
- `pnpm --filter @workspace/loyalty-app run dev` — run the frontend (port 3000, proxied to /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only); then run `pnpm run typecheck:libs` to rebuild declarations
- Required env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Wouter + Clerk Auth
- API: Express 5 + Clerk middleware
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas
- `lib/db/src/schema/` — Drizzle ORM table definitions
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/loyalty-app/src/pages/` — React pages (admin/* and portal/*)
- `artifacts/loyalty-app/src/components/layout/` — AdminLayout and PortalLayout

## Architecture decisions

- **Contract-first API**: OpenAPI spec is the single source of truth; hooks and Zod schemas are generated from it.
- **Admin detection via `isAdmin` column**: The `customers` table has an `isAdmin` boolean; the frontend checks Clerk metadata OR email ending in `@loyalpro.com`.
- **Points formula**: 1 dollar = 1 point by default; admin can set custom points per service.
- **Discount tiers**: 100 pts = 5%, 500 pts = 10%, 1000 pts = 15%.
- **Membership tiers**: Bronze (0–499), Silver (500–1999), Gold (2000–4999), Platinum (5000+).
- **Port 3000 for frontend**: Changed from the initially-assigned 19751 (not a supported workflow detection port) to 3000.

## Product

- **Landing page** — public marketing page with "Sign In" CTA
- **Admin dashboard** — stats, membership breakdown, top customers; manage all customers, services, points, referrals, and commissions
- **Customer portal** — personal overview, point history, referral code + link, discount tier progress, commission tracking
- **Referral system** — each customer has a unique referral code; admin confirms/rejects referrals to trigger bonus points or commissions

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After modifying `lib/db/src/schema/`, run `pnpm run typecheck:libs` to rebuild lib declarations before running the API server typecheck.
- Port 19751 is NOT a supported workflow detection port — use 3000 (or another port from the supported list: 3000, 3001, 3002, 3003, 4200, 5000, 5173, 6000, 6800, 8000, 8008, 8080, 8099, 9000).
- Admin routes require a valid Clerk session token — unauthenticated requests return 401.
- To link a Clerk user to a customer record, set `clerkUserId` on the customer row via the admin API (PATCH /api/admin/customers/:id).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk configuration details

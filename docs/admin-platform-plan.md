# Meridian — Admin Platform & Backend Plan

_Last updated: 2026-06-13. Covers: authentication, admin dashboard, user management, product management, order fulfillment & tracking, billing & revenue, customer data, and CMS strategy._

## Implementation status — all 6 phases shipped

Stack chosen: **Neon Postgres + Drizzle**, **Better Auth** (email/password, `customer`/`staff`/`admin`), **Razorpay** (with a demo-capture fallback when keys are absent), **DB-backed content blocks** (no Sanity). Built and verified end-to-end:

- **P1 Data layer** — schema + `scripts/seed.ts`; storefront reads from DB; `soldOutSizes` derived from variant stock.
- **P2 Auth** — `proxy.ts` gate, `unauthorized`/`forbidden`, real `/account`.
- **P3 Admin** — role-gated shell, dashboard, product CRUD + variant matrix, inventory.
- **P4 Orders** — server-validated checkout, Razorpay + webhook (idempotent capture, stock decrement), fulfillment state machine, tracking, refunds, audit timeline; signed-token confirmation.
- **P5 Customers/revenue** — customers + LTV, staff/role management, analytics (period-delta KPIs, revenue chart, category split, GST, new/returning), CSV export.
- **P6 Content/polish** — DB content blocks wired to hero + announcement bar, reviews moderation, store/shipping/tax settings consumed at checkout.

Demo logins: `james.whitfield@example.com / meridian` (customer), `admin@meridian.demo / meridian-admin` (admin). To go live on payments, set the `RAZORPAY_*` env vars (see `.env.example`) — checkout switches from demo-capture to the real gateway automatically.

## 1. Where the project stands today

The storefront UI is complete (shop, product pages, cart, checkout, account, wishlist, login/register), but **everything behind it is mocked**:

- Product/category/review data is hardcoded in `lib/data/*.ts` (28 products, 6 categories).
- `/login` and `/register` are visual-only; `currentUser` is hardcoded in `lib/data/user.ts`.
- Checkout writes the order to `sessionStorage` and redirects — no API routes, no server actions, no database, no payments.
- Cart/wishlist live in `localStorage` via React Context (this part can stay).

Stack: Next.js **16.2.9** (App Router, React 19, Tailwind v4, shadcn/Base UI), deployed on Vercel. Prices are in **INR with GST**.

**Next.js 16 conventions that differ from older training data** (verified in `node_modules/next/dist/docs/`):
- `middleware.ts` is **deprecated** → use **`proxy.ts`** at project root (same matcher/NextResponse API).
- New `app/unauthorized.tsx` + `unauthorized()` (401) and `app/forbidden.tsx` + `forbidden()` (403) conventions — we'll use these for auth/role gating.
- `params` is a Promise (`await params`) — already followed in this repo.
- Route Handler `GET` is dynamic by default.

## 2. Architecture decisions (recommendations)

| Concern | Recommendation | Why |
|---|---|---|
| Database | **Neon Postgres** (Vercel Marketplace) | Serverless Postgres, branchable for dev; Neon MCP already connected in this workspace. |
| ORM | **Drizzle** | TS-first, lightweight, plays well with Neon serverless driver; schema doubles as documentation. |
| Auth | **Better Auth** (email/password + sessions in Postgres) | We need our own `users` table anyway (orders, addresses, roles); Better Auth gives sessions, password hashing, and an admin plugin (roles, ban, impersonate) without an external SaaS. _Alternative: Clerk if hosted UI/user-management is preferred — native Vercel Marketplace integration._ |
| Authorization | Role enum on user: `customer` / `staff` / `admin` | Coarse gate in `proxy.ts` (session cookie present?), **real** role check server-side in the admin layout + every server action, using `forbidden()`/`unauthorized()`. |
| Payments | **Razorpay** (INR-native: UPI, cards, netbanking) | Store prices are ₹ + GST. _If this stays a demo, Stripe test mode is acceptable; decide before Phase 4._ |
| Transactional email | **Resend** + React Email | Order confirmation, shipping updates, password reset. |
| Product images | **Vercel Blob** | Admin uploads replace the current Unsplash JSON pools. |
| CMS | **Hybrid — see §8.** Products/orders never go in a CMS. Editorial content (hero, announcement bar, info pages, about) → Sanity _only if_ non-developer editors need it; otherwise a DB-backed "Content" section in the admin. |

## 3. Data model (Drizzle / Postgres)

Better Auth owns `user`, `session`, `account`, `verification` tables; we extend `user` with `role`, `phone`, `status`.

```
users            id, name, email, role(customer|staff|admin), status(active|disabled), createdAt
addresses        id, userId, label, name, line1, line2, city, region, postal, country, isDefault
categories       id, slug, name, description, sortOrder
products         id, slug, name, subtitle, categoryId, description, details[], fit,
                 price, compareAtPrice, badges[], status(draft|active|archived), createdAt
product_images   id, productId, url, thumbUrl, alt, sortOrder
product_variants id, productId, color, colorHex, size, sku, stock, priceOverride?
                 → "soldOutSizes" becomes derived: stock = 0
orders           id, number("MER-10428"), userId?, email, status, paymentStatus, fulfillmentStatus,
                 subtotal, shipping, tax, discount, total, currency,
                 shippingAddress(jsonb snapshot), billingAddress(jsonb),
                 carrier?, trackingNumber?, trackingUrl?, placedAt, ...
order_items      id, orderId, productId?, variantSku, name, image, color, size, qty, unitPrice
                 → snapshot fields, so deleted products never break history
order_events     id, orderId, type(status_change|note|email_sent|tracking_added),
                 fromStatus?, toStatus?, message, actorUserId?, createdAt   ← audit timeline
payments         id, orderId, provider, providerPaymentId, amount, status, method, raw(jsonb)
refunds          id, paymentId, amount, reason, providerRefundId, createdAt
reviews          id, productId, userId, rating, title, body, status(pending|published), createdAt
content_blocks   id, key("home.hero"|"announcement"|"info.shipping"...), json, updatedBy, updatedAt
                 → only if we skip Sanity (see §8)
```

**Order state machine** (one `status` driving two sub-states):

```
pending → paid → processing → shipped → delivered
   ↘ payment_failed       ↘ cancelled (before ship)
paid/delivered → refund_requested → refunded (full/partial)
```

Every transition writes an `order_events` row (who, when, what) — that's the fulfillment timeline shown to both admin and customer.

**Migration of existing mock data:** a `scripts/seed.ts` imports `lib/data/products.ts`, `categories.ts`, `orders.ts`, `reviews.ts` into the DB so the storefront looks identical after the switch. Storefront pages swap `import { products }` for Drizzle queries in server components (interfaces in `lib/types.ts` stay the contract).

## 4. Authentication design

- **Customer auth**: wire the existing `/login` and `/register` AuthForm to Better Auth (email/password; optional Google OAuth later). Real `/account` page replaces the `currentUser` mock; guest checkout stays allowed (order keyed by email, claimable on signup).
- **Admin auth**: same login, but `/admin/**` requires `role in (staff, admin)`.
- **Layers of protection**:
  1. `proxy.ts` (root): no session cookie on `/admin/**` or `/account` → redirect to `/login?next=…`. Cheap, runs before render. (File is `proxy.ts`, **not** `middleware.ts`.)
  2. `app/(admin)/admin/layout.tsx`: server-side session + role check → `unauthorized()` / `forbidden()`; add `app/unauthorized.tsx` and `app/forbidden.tsx`.
  3. Every admin server action / route handler re-checks the session (never trust the proxy alone).
- Staff vs admin split: `staff` can manage products/orders; only `admin` can manage users/roles, issue refunds, see revenue, edit settings.

## 5. Admin app structure

Route group with its own chrome (sidebar + topbar, shadcn `sidebar` component), isolated from storefront layout:

```
app/(admin)/admin/
├── layout.tsx                    auth+role gate, sidebar nav
├── page.tsx                      Dashboard: today/7d/30d revenue, orders to fulfill,
│                                 low-stock alerts, recent orders, top products
├── orders/page.tsx               table: filter by status/date/customer, search by number/email
├── orders/[id]/page.tsx          detail: items, payment, address, status advance buttons,
│                                 carrier+tracking entry, refund, internal notes, event timeline
├── products/page.tsx             table: search/filter, status, stock indicators, bulk archive
├── products/new/page.tsx         create form
├── products/[id]/page.tsx        edit: fields, image upload/reorder (Blob), variant matrix
│                                 (color×size → SKU, stock, price), badges, draft/active
├── inventory/page.tsx            flat variant/SKU stock view, low-stock filter, quick adjust
├── customers/page.tsx            table: name/email, orders count, lifetime value, joined
├── customers/[id]/page.tsx       profile, addresses, order history, notes, disable account
├── users/page.tsx                (admin-only) staff & roles, invite, ban — Better Auth admin plugin
├── analytics/page.tsx            revenue module — see §7
├── reviews/page.tsx              moderate pending reviews
├── content/page.tsx              editorial blocks (or deep-link to Sanity Studio — §8)
└── settings/page.tsx             shipping rates, free-shipping threshold, GST rate, store info
```

Mutations are **server actions** co-located per module (`app/(admin)/admin/_actions/`). Public route handlers are only needed where third parties call us: `app/api/webhooks/razorpay/route.ts` (and `app/api/webhooks/sanity/route.ts` for revalidation if Sanity is adopted).

## 6. Order fulfillment, tracking & past orders

**Checkout becomes real** (Phase 4):
1. Server action `createOrder`: validate cart against DB prices/stock (never trust client), create `orders` + `order_items` rows in `pending`, decrement-reserve stock.
2. Create Razorpay order → client opens Razorpay checkout → webhook confirms → order `paid`, `payments` row written, confirmation email sent, cart cleared. Failed/abandoned payments release stock after TTL.
3. `/order-confirmation` reads the real order (by id + email token), not sessionStorage.

**Fulfillment flow (admin)**: dashboard surfaces "to fulfill" queue → admin opens order → advances `processing` → enters carrier + tracking number (Delhivery/Blue Dart/India Post, or free text + URL) → `shipped` (customer gets tracking email) → `delivered` (manual for now; carrier-API automation is a later enhancement). Cancel restocks items; refund goes through provider API and writes a `refunds` row.

**Customer side ("past orders")**: `/account` lists the user's real orders with status, timeline (from `order_events`), tracking link, and reorder (re-add items to cart). Guest lookup: order number + email.

## 7. Billing & revenue module (`/admin/analytics`, admin-only)

- **KPIs** with period selector (today / 7d / 30d / quarter / custom) and previous-period deltas: gross revenue, net (minus refunds), orders, AOV, units sold.
- **Charts**: revenue over time (daily/weekly), orders by status funnel, revenue by category, top 10 products, new vs returning customers.
- **Tables**: recent transactions (payment + refund ledger from `payments`/`refunds`), GST collected (tax column summed per period — needed for filing), payouts-reconciliation view (provider fee vs settled amount, fed by webhook data).
- **Export**: CSV for orders and the transaction ledger per date range.
- Implementation: SQL aggregates via Drizzle, server components, shadcn charts (`--chart-*` tokens already exist in `globals.css`). No analytics SaaS needed at this scale.

## 8. CMS strategy — do we need Sanity?

**Verdict: not for commerce data, optional for editorial.**

- **Never in a CMS**: products, variants, stock, prices, orders, customers. This is transactional data the checkout must validate against — it belongs in Postgres, managed by our own admin. Putting products in Sanity would mean syncing stock/orders across two systems for zero benefit.
- **Genuinely CMS-shaped content**: homepage hero + featured collections, announcement bar, `/about` editorial, `/info/[slug]` pages (shipping/returns/FAQ), nav promos, future lookbook/journal.

Two viable options for that editorial slice:

| | A. DB-backed `content_blocks` + admin Content screen | B. Sanity (free tier) |
|---|---|---|
| Extra service/accounts | none | Sanity project + Studio (can mount at `/studio`) |
| Editing UX | simple forms we build | excellent (portable text, image pipeline, live preview, scheduling) |
| Effort | ~1 dev-day | ~2–3 dev-days incl. webhook revalidation |
| Right when | devs/founder edit content | marketing/non-technical editors own content |

**Recommendation**: ship **Option A** in the admin first (it's one table + one screen, and keeps Phase 1–5 focused). Adopt Sanity as a Phase 6 swap only if a real content team materializes — the storefront reads content through one `lib/content.ts` accessor either way, so the swap is contained.

## 9. Phased rollout

| Phase | Scope | Key deliverables |
|---|---|---|
| **1. Data layer** | Neon + Drizzle + seed | schema, `scripts/seed.ts` from mock data, storefront reads from DB (no visual change) |
| **2. Auth** | Better Auth | wire login/register, sessions, roles, `proxy.ts`, `unauthorized.tsx`/`forbidden.tsx`, real `/account` |
| **3. Admin core** | shell + products + inventory | `(admin)` layout/sidebar, product CRUD with Blob image upload, variant/stock matrix |
| **4. Orders & payments** | real checkout | `createOrder` action, Razorpay + webhook, emails (Resend), admin order list/detail, fulfillment states + tracking, customer order history |
| **5. Customers & revenue** | management + analytics | customers module, staff/user management, analytics dashboard, CSV export, refunds |
| **6. Content & polish** | editorial | content blocks screen (or Sanity swap), review moderation, settings screen |

Each phase is independently shippable; the storefront keeps working throughout (mock data is replaced, not the UI).

## 10. Decisions to confirm before implementation

1. **Payments**: Razorpay (real INR) vs Stripe test-mode (pure demo)?
2. **Auth**: Better Auth self-hosted (recommended) vs Clerk hosted?
3. **Guest checkout**: keep allowed (recommended) or force account?
4. **CMS**: start with DB-backed content blocks (recommended) or go straight to Sanity?
5. Are the existing mock orders/user wanted as seed data in the admin demo? (Recommended: yes, plus a faker-generated batch so analytics charts look alive.)

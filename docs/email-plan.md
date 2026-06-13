# Meridian — Transactional Email Plan

_Last updated: 2026-06-13. Covers provider choice (India context), the full set of emails, their trigger points, and template/config standards._

## 1. Provider recommendation (India)

**Use Resend** (already integrated) as the sending provider, with React Email for templates.

Why Resend for an India-based store:
- **Deliverability**: built on AWS SES with managed IP reputation; lands reliably in Gmail/Outlook/Yahoo, which dominate Indian consumer inboxes. Transactional receipts to Indian users are not a problem from a US-based sender.
- **DX + maintainability**: first-class React Email support (what we use), so every template is a typed React component rendered to bulletproof cross-client HTML.
- **Already wired** and the transport is a single file (`lib/email.ts`) — the rest of the app only calls `sendEmail()`, so the provider is swappable without touching templates or triggers.

**India-native alternatives** (documented so the swap is a known quantity if cost-at-scale or data residency become priorities):

| Provider | When to switch | Notes |
|---|---|---|
| **Zoho ZeptoMail** | Lowest cost + Indian company + data residency | Chennai-based (Zoho); purpose-built transactional; ~₹ pricing, far cheaper than USD providers at volume; India/EU/US data centres. Strongest India-native option. |
| **Amazon SES (Mumbai, ap-south-1)** | Data residency + huge scale, cheapest raw send | More setup (no template DX); good if already on AWS. |
| **Brevo / MSG91** | Bundling email with SMS/WhatsApp for India | MSG91 is India-native and strong for OTP/SMS + email together. |

Switching = rewrite `lib/email.ts` only (implement `sendEmail()` against the new SDK). Templates (`emails/*`), triggers (`lib/notify.ts`, `lib/orders.ts`), and idempotency stay identical.

### Sending configuration (do this before going live)
- **Sending domain**: a subdomain dedicated to mail, e.g. `send.meridian.in` (keeps the root domain's reputation isolated). Set `RESEND_FROM="MERIDIAN <orders@send.meridian.in>"`.
- **DNS auth** (Resend generates these): **SPF**, **DKIM**, and a **DMARC** policy (`p=none` to start, tighten to `quarantine`). Required for Gmail/Yahoo bulk-sender rules — without them, mail goes to spam.
- **Reply-To**: a monitored human inbox (`support@meridian.in`), separate from the no-reply `from`.
- **Admin notifications**: `ADMIN_ORDER_EMAIL` receives the internal new-order alert.
- All env vars are documented in `.env.example`. With no `RESEND_API_KEY`, sends are logged (demo-safe) and still recorded on the order timeline.

## 2. The emails, and exactly where they fire

### Customer — order lifecycle
| Email | Trigger point | Code path |
|---|---|---|
| **Order confirmation** | Payment captured | `markOrderPaid()` → `sendOrderConfirmation` |
| **Payment failed** | `payment.failed` webhook / verify failure | `markPaymentFailed()` → `sendPaymentFailed` |
| **Order shipped** (carrier + tracking + track button) | Order enters `shipped` | `transitionOrder(→shipped)` → `sendShippingUpdate` |
| **Order delivered** | Order enters `delivered` | `transitionOrder(→delivered)` → `sendDeliveredUpdate` |
| **Order cancelled** | Order enters `cancelled` | `transitionOrder(→cancelled)` → `sendCancelled` |
| **Refund issued** | Refund processed | `refundOrder()` → `sendRefundIssued` |

Every order email writes an `email_sent` row to `order_events`, so it shows on the admin order timeline and **can't double-send** (verify callback + webhook are idempotent on the event tag).

### Customer — account
| Email | Trigger point | Code path |
|---|---|---|
| **Welcome** | Account created | Better Auth `databaseHooks.user.create.after` → `sendWelcome` |
| **Password reset** | "Forgot password" requested | Better Auth `emailAndPassword.sendResetPassword` → `sendPasswordReset` (drives `/forgot-password` → `/reset-password`) |

### Internal — operations
| Email | Trigger point | Code path |
|---|---|---|
| **New order alert** (to staff/admin) | Payment captured | `markOrderPaid()` → `sendAdminNewOrder` (to `ADMIN_ORDER_EMAIL`) |

### Deliberately out of scope (need consent + a marketing platform, not transactional)
Abandoned-cart, back-in-stock, review requests, newsletters. These require explicit marketing consent and a separate sending stream/domain; noted for a future marketing phase.

## 3. Template standards (best-UX checklist)

Built with **React Email** (`emails/`), sharing one `EmailLayout` so every message is consistent:
- **Brand**: bone background `#f3f1ea`, white card, ink `#1c1a17`, clay accent `#8a6a47`, Georgia serif headings (email-safe stand-in for Fraunces), system sans body.
- **Structure**: wordmark header → one clear headline → scannable detail → a single primary action (button) → quiet footer with support contact + address.
- **Robustness**: table-based layout, inline styles, a `<Preview>` preheader line, and a **plain-text alternative** rendered alongside HTML (deliverability + accessibility).
- **Order emails** share an items table, totals block, and shipping-address block via shared components, so confirmation/shipped/delivered/cancelled/refund all read consistently.
- **Mobile**: single-column, ≥16px tap targets, fluid container.
- **Trust**: real order number, support email, and "why you got this" footer line.

Preview locally with `npm run email` (React Email dev server) while iterating on templates.

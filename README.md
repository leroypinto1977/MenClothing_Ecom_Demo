# MERIDIAN — Demo Menswear Store

A polished, fully-navigable **demo ecommerce website** for a premium men's clothing
brand, built for client presentation. This phase is **UI + dummy content only** — the
interface, flows, and aesthetic are complete; the backend (real payments, auth, CMS,
inventory) is intentionally not wired up yet.

- **Aesthetic:** Premium minimal — warm bone/ink palette, a single clay accent, Fraunces
  serif display + Geist sans, large editorial photography.
- **Brand:** _MERIDIAN — "Modern essentials, refined."_ (invented for the demo; easily
  swapped for the client's real brand.)

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a custom brand theme (`app/globals.css`)
- **shadcn/ui** (Base UI primitives) + **lucide-react** icons
- Client state via React Context + `localStorage` (cart & wishlist)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all routes type-check & prerender)
```

## Screens

| Route | Screen |
|-------|--------|
| `/` | Home — hero, categories, new arrivals, lookbook, bestsellers, brand story |
| `/shop` · `/shop/[category]` | Listing with filters (size, colour, price, fit), sort |
| `/products/[slug]` | Product detail — gallery + zoom, variants, size guide, reviews, related |
| `/cart` | Shopping bag + slide-out drawer |
| `/checkout` | Multi-section checkout with sticky summary |
| `/order-confirmation` | Order success + tracker |
| `/account` | Tabbed hub — overview, orders, addresses, settings |
| `/wishlist` | Saved items |
| `/login` · `/register` | Split-screen auth |
| `/about` | Editorial brand story |
| `404` | Custom not-found |

Interactive (demo-wired): cart drawer with live count, wishlist toggle, search overlay
with type-ahead, mega menu, mobile nav, add-to-cart toasts. Cart & wishlist persist to
`localStorage`; checkout & auth are visual mocks.

## Dummy content

All content lives in `lib/data/` as typed objects (`products.ts`, `categories.ts`,
`reviews.ts`, `orders.ts`, `user.ts`) — structured to mirror a future API/CMS so swapping
in real data is straightforward.

**Imagery** is a curated, verified pool of menswear photos (`lib/data/images.json`).
To refresh it:

```bash
node scripts/harvest-images.mjs   # pull fresh photos by category
node scripts/verify-images.mjs    # keep only URLs that resolve, cap per category
```

## Swapping in the real brand

- Brand name/wordmark: `components/brand/wordmark.tsx`
- Colours, fonts, radius: the `:root` tokens in `app/globals.css`
- Catalogue & copy: `lib/data/`

## Next phase (not in this demo)

Real payments (Stripe), authentication, a CMS/PIM for the catalogue, inventory, search,
and order management.

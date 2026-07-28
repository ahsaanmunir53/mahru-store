# MAHRU — Demo Luxury Fashion Store

A complete mock e-commerce storefront in the style of a luxury Pakistani ethnic-wear boutique.
React 18 + Vite + TypeScript + Tailwind on the front, a small Node/Express mock backend behind it,
and a built-in **Shopify Storefront API mode** — add credentials and the same UI runs on live Shopify data.

Everything (name, copy, products, imagery) is original placeholder content, designed to be replaced.

---

## 1. Run it locally

Two terminals:

```bash
# Terminal 1 — backend (mock catalog + orders), port 5001
cd backend
npm install
npm run dev

# Terminal 2 — frontend, port 5173
npm install
npm run dev
```

Open http://localhost:5173

Production build: `npm run build` → static files in `dist/` (host anywhere: Vercel, Netlify, S3, nginx).

---

## 2. What's inside

| Route | Page |
|---|---|
| `/` | Home — hero, category tiles, product rows, sale banner, reviews wall, newsletter |
| `/collections/:handle` | Collection grid with sorting (featured / newest / price) |
| `/products/:handle` | Product — gallery, size variants, qty, add to bag, accordions, related pieces |
| `/search?q=` | Search across titles, descriptions, fabrics, collections |
| `/cart`, cart drawer | Bag with qty steppers, remove, subtotal, free-shipping note |
| `/checkout` | Delivery form, COD / Bank-transfer, order summary; success screen with WhatsApp CTA |
| `/pages/:handle` | Our Story, Shipping, Returns, Size Guide, FAQs, Contact (with form) |

Mock backend endpoints (`backend/server.js`):

- `GET /api/products` (`?collection=`, `?q=`), `GET /api/products/:handle`
- `POST /api/orders` — validates items, **recomputes totals server-side** (free shipping ≥ Rs.5,000, else Rs.350)
- `GET /api/orders` — requires header `x-admin-key` (see `backend/.env`, default `mahru-admin-2026`)
- `POST /api/newsletter`, `POST /api/contact`, `GET /api/health`

Seed data: 29 demo products across 11 collections, auto-created on first run in `backend/data/products.json`.
Edit that file (or delete it to re-seed) to change the demo catalog.

---

## 3. Rebrand in minutes

Almost everything lives in **`src/data/site.ts`**:

- `brand` — store name, tagline, **WhatsApp number** (digits only, e.g. `9230xxxxxxxx`), email, address, socials
- `announcement` — top bar text
- `nav`, `collections`, `hero`, `homeRows` — menus, category tiles, homepage sections
- `reviews`, `pages`, `footerMenus` — reviews wall, policy pages, footer

Colors and fonts: `tailwind.config.js` (ivory / ink / gold / henna tokens) and the Google Fonts link in `index.html`.

### Adding real photos
No code changes needed — drop files in and they take over automatically:

- Products: `public/images/products/<handle>-1.jpg` (then reference them in `backend/data/products.json` → `images: ["/images/products/<handle>-1.jpg", ...]`)
- Until an image exists, every product renders its unique "fabric swatch" placeholder art, so the demo never looks broken.

---

## 4. Connect Shopify (headless mode)

The storefront speaks the **Shopify Storefront API** natively. To switch from mock data to a live store:

1. In Shopify admin: **Settings → Apps and sales channels → Develop apps → Create app**
2. Configure **Storefront API scopes**: `unauthenticated_read_product_listings`,
   `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts` → Install app
3. Copy the **Storefront API access token**
4. In the project root `.env`:

```
VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxx
```

5. Restart `npm run dev` (or rebuild).

What changes in Shopify mode:

- Catalog, collections, search and product pages pull **live Shopify products** (match collection handles in Shopify to the ones in `src/data/site.ts`, or edit that file to your Shopify handles).
- Checkout shows a **"Pay securely via Shopify checkout"** button — the cart is pushed to Shopify (`cartCreate`) and the customer pays on Shopify's hosted checkout, so payments, inventory and orders live in **Shopify admin**.
- The mock backend is no longer needed for the catalog (the contact/newsletter forms still use it; swap them for a form service if you host frontend-only).

> Note: the Shopify code path follows the standard Storefront API contract but was written without a live
> store attached — plug in real credentials and give it a quick pass before a client demo.

---

## 5. Honest scope notes

- This is a **demo/sales tool and headless starter**, not a Shopify theme. A standard client build on a
  Shopify theme is a separate (smaller) job; a custom headless storefront like this one is a bigger ticket.
- COD / Bank-transfer orders in mock mode are stored in `backend/data/orders.json` — view them with:
  `curl localhost:5001/api/orders -H "x-admin-key: mahru-admin-2026"`
- All product names, reviews, and copy are fictional placeholders.

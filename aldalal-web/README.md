# ALDALAL Price List — website & app

Online catalog for **ALDALAL For General Trading**, built from the Excel price list:
725 products with photos, search, category filters, favorites, and a cart that sends the order over WhatsApp.
It also installs on a phone like an app and keeps working offline.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript · Motion for animation.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

### Open it on your phone (same Wi-Fi)

```bash
npm run dev:lan     # dev server other devices can reach
npm run preview     # production build + server (much faster on phones)
```

Find your laptop's IP with `ipconfig` (the IPv4 address, like `192.168.1.20`) and open
`http://192.168.1.20:3000` on the phone. `next.config.ts` already allows `192.168.*.*`,
`10.*.*.*` and `172.*.*.*` to use the dev server — without that Next.js blocks the phone's
requests for the page's JavaScript.

Dev mode is slow on phones (it compiles as you browse). Judge speed with `npm run preview`.

**Installing the app and offline mode need https**, so they only work once the site is deployed
(Vercel gives you https automatically). On an iPhone you install through Safari's
Share → *Add to Home Screen*; Chrome shows its own install button.

## Pages

| Route | What it is |
|---|---|
| `/` | Home: animated hero, featured / new / best-value rails, all categories, recently viewed |
| `/products` | Full catalog: search, category filter, sorting, loads more as you scroll |
| `/product/<id>` | One page per product — its own link for sharing on WhatsApp, with related products |
| `/favorites` | Products the customer saved with the heart (kept on their device) |
| `/offline` | Shown if a page hasn't been saved yet and there is no internet |

## Update products from Excel

Replace `data/price-list.xlsx` with the new file (same layout), then run:

```bash
npm run import                          # uses data/price-list.xlsx
npm run import -- ~/Downloads/new.xlsx  # or any other file
```

This regenerates:

- `src/data/products.json` (names, prices, categories)
- `public/products/<id>-<hash>.webp` — the card photo, up to 480px (about 10 KB)
- `public/products/<id>-<hash>@2x.webp` — the big photo (up to 1200px) used by the product page and the
  zoom view (about 30 KB)
- `data/categories.json` — the categories, remembered by product name
- `public/logo.png`, the app icons and `favicon.ico` (from the image in the top-left of the sheet)

The Excel layout it expects (first sheet):

| A | B | C | D |
|---|---|---|---|
| `SHAMPOO  (148 items)` ← category row | | | |
| 1 | photo placed on this row | Product name | 1.71 |
| 2 | photo | Product name | *(empty = "Ask for price")* |

- Photos are matched to the row where their top-left corner sits, so keep each photo inside its row.
- **Category rows are optional.** If the sheet is a flat list, the categories from the previous import
  are reused from `data/categories.json` (matched by product name). Delete that file to start over.
- Rows with no product name are skipped and the script prints a warning for them.
- The `Total` row at the bottom is ignored.
- Keep photos as normal floating pictures ("Place over Cells"). Excel's **Place in Cell** images are not readable.

## Photo quality

The site uses whatever resolution the sheet contains: each photo is written twice, a small one for the
cards and one up to 1200px for the product page and zoom. If a photo in the sheet is small, the big
copy is upscaled and sharpened, which helps but cannot invent detail.

To replace individual photos with better ones, put files in `data/photos/`, named after the product id:

```
data/photos/colgate-advanced-white-toothpaste-75ml.jpg
```

(The id is the last part of a product page URL.) Anything you put there replaces the sheet's photo on
the next `npm run import`. 1000px or larger gives a genuinely sharp zoom.

Every product page has a **zoom view**: tap the photo to open it, then pinch, scroll or use the + / −
buttons, drag to move, double-tap to fill the screen, Esc or ✕ to close. The watermark and the other
protections apply there too.

## Colors and type

The whole site is built from one palette in `src/app/globals.css` (the `@theme` block).
Change the tokens there and every page, dialog and button follows.

Current look — **Atelier**: cream paper, espresso ink, thin gold rules, burgundy for anything you can
act on, forest green for WhatsApp.

| Token | Value | Used for |
|---|---|---|
| `--color-paper` | `#f7f3ec` | page background |
| `--color-surface` | `#fffdf9` | cards, drawers, dialogs |
| `--color-ink` | `#241e1a` | headings, body text, the primary button |
| `--color-muted` | `#6b6055` | secondary text |
| `--color-line` / `--color-line-soft` | `#e3dbcd` / `#efe8dc` | hairline borders |
| `--color-gold-500` / `-700` | `#b8893b` / `#8a6413` | rules, eyebrows, "Ask for price" |
| `--color-wine-600` / `-700` | `#6d2432` / `#551a26` | cart, Add, favourites |
| `--color-forest-600` | `#1f5f4e` | WhatsApp buttons |

Two typefaces: **Geist** for interface text (the `geist` package) and **Playfair Display** for every
heading, product name and price (`@fontsource-variable/playfair-display`, loaded locally through
`next/font/local` — no Google Fonts request at runtime). Both are npm dependencies, so `npm install`
is enough; nothing to download by hand.

The 3D comes from a few utilities in the same file: `.scene` / `.scene-deep` set the perspective,
`.tilt` rotates a card towards the pointer, `.tilt-layer` lifts an element out of the card (`--depth`),
`.tilt-sheen` is the light sweep, and `.pedestal-shadow` + `.float-product` make a product hover over
its shadow. Tilt is mouse-only and everything is switched off under
`prefers-reduced-motion: reduce`, so phones stay fast.

## Photo protection

`protectPhotos` in `src/config/site.ts` (currently `true`) turns on:

- no right-click menu anywhere on the site, and none on a photo on phones (no long-press "Save image")
- photos cannot be dragged to the desktop, selected, or copied
- an invisible layer over every photo, so the browser targets it instead of the image
- a faint repeating shop name over each product photo
- blocked shortcuts: Ctrl/Cmd+S, Ctrl/Cmd+U, Ctrl/Cmd+P, F12 and the developer-tools combinations

Be honest with yourself about the limit: **a screenshot always works**, and someone who knows the browser's
developer tools can still reach the file. This stops casual copying, not a determined person.
Set `protectPhotos: false` to remove all of it (including the watermark).

## Things you will want to edit

| What | File |
|---|---|
| Shop name, phones, address, WhatsApp number | `src/config/site.ts` |
| Featured / new / best-value rails on the home page | `src/config/collections.ts` |
| Colors, fonts, 3D and animations | `src/app/globals.css` |
| Photo protection on/off | `src/config/site.ts` (`protectPhotos`) |
| Offline behaviour and what gets cached | `public/sw.js` |

In `src/config/collections.ts` each rail is a list of product ids. An id is the product name in
file-name style, for example `colgate-advanced-white-toothpaste-75ml` — copy it from the product page
URL. Ids that are no longer in the price list are skipped automatically, and "Best value" picks the
cheapest product in each category on its own.

## Deploy

- **Vercel**: import the repo, no extra settings.
- **Static hosting** (Firebase Hosting, Netlify, cPanel…): `npm run build:static`, then upload `out/`.
  With Firebase, set `"public": "out"` in `firebase.json`.

Set `NEXT_PUBLIC_SITE_URL=https://your-domain.com` so WhatsApp and Facebook link previews use the right address.

The app installs ("Add to home screen") only over **https**, so the install button appears once the site is live
on a real domain — not on `localhost`.

## How it works

- **Search** matches every word you type against the product name and category, ignoring case and punctuation.
  `400 ml` also finds `400ml`. Press `/` or `Ctrl/Cmd + K` anywhere to open it.
- **Filters live in the URL**, so `/products?cat=toothpaste&sort=price-asc` can be shared or bookmarked.
- **Cart and favorites** are saved in the customer's browser. Products that disappear from a new price list are
  dropped automatically.
- **WhatsApp order**: the message lists each item with quantity and line total, then the subtotal. Items with no
  price are marked "price to confirm", and the customer's name, address and note are added if they filled them in.
- **Offline**: a service worker (`public/sw.js`) saves the pages and photos the customer has opened. Bump
  `CACHE_VERSION` in that file after a big change so their phones fetch the new version.
- **Animations** respect the phone's "reduce motion" setting and switch off when it is on.

## Project structure

```
data/price-list.xlsx        source Excel file
scripts/import-excel.mjs    Excel -> JSON + WebP + icons importer
src/config/site.ts          shop details and WhatsApp number
src/config/collections.ts   home page rails
src/data/products.json      generated product data (don't edit by hand)
src/lib/                    catalog data, cart, favorites, recently viewed, filters, toasts, WhatsApp text
src/components/             header, hero, rails, cards, catalog, product page, cart drawer, search overlay
public/sw.js                offline cache
src/app/manifest.ts         "add to home screen" settings
```

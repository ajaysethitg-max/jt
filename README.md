# Jeet Telecom — Storefront

E-commerce storefront for **Jeet Telecom** (Dehradun): mobiles, audio, wearables and accessories with same-day delivery, 0% finance, free gifts, deals of the day with countdown timers, a persistent cart and a streamlined checkout.

Built with Next.js (App Router), Tailwind CSS v4 and — when hosted with a server — PostgreSQL via Drizzle ORM.

## Hosting on GitHub

The same code base builds in two ways. Pick the one you need:

| | **GitHub Pages** (static) | **Node + Postgres** (server) |
| --- | --- | --- |
| Where | GitHub Pages, free | Render / Railway / Fly.io / VPS / Docker |
| How it is built | `NEXT_PUBLIC_STATIC_BUILD=true` | default `npm run build` |
| Products, logo, deals + timers | Google Sheet, read live in the browser | Google Sheet synced into Postgres (`/admin/sync`) |
| Orders | Sent to the shop on **WhatsApp** | Stored in **Postgres** |
| Customer reviews | Stored in the customer's browser | Stored in Postgres |
| Deploy | `.github/workflows/deploy-pages.yml` on every push to `main` | `render.yaml` or the `Dockerfile` |

### 1. Publish to GitHub Pages

1. Create a repository and push this project (needs `package-lock.json`, committed here).
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The **Deploy to GitHub Pages** workflow builds and publishes the site at `https://<user>.github.io/<repo>/` (the base path is detected automatically). It also rebuilds daily at midnight IST so prerendered pages and deal timers never go stale.

A GitHub Pages site cannot run a database or API routes, so in this mode the checkout hands each order to the shop through a prefilled **WhatsApp** message, and the browser applies catalogue updates from your sheet (cached in `localStorage`, refreshed on every visit). Products added to the sheet after a deploy still work: the smart 404 page checks the live catalogue and renders the new product.

### 2. Connect your Google Sheet (both modes)

One public sheet with four tabs drives products, prices, stock, images, the **logo**, announcements, free gifts, finance partners and the **Deal of the Day with its countdown timer**.

1. Take the four CSV files in [`catalog/`](catalog) and import them into a new Google Sheet — one tab each, named `Products`, `Deals`, `Reviews`, `Settings`.
2. **Share → Anyone with the link → Viewer**.
3. Tell the site where the sheet is:
   - **GitHub Pages:** GitHub → Settings → Secrets and variables → Actions → **Variables** → add `NEXT_PUBLIC_GOOGLE_SHEET_ID` (the ID in the sheet URL), then re-run the workflow. Optionally add the `NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY` **secret** (Google Cloud console, Sheets API enabled) for faster reads.
   - **Server mode:** set `GOOGLE_SHEET_ID` in `.env` / hosting dashboard and press **Sync from Google Sheet** on `/admin/sync`.

| Tab | Columns |
| --- | --- |
| Products | `SKU, Name, Brand, Category, Price, MRP, Stock, Badge, Short Description, Description, Images (| separated), Colors, Storage, Screen, Battery, Processor, Warranty, Tags, Featured, Slug` |
| Deals | `SKU, Deal Price, Label, Starts At, Ends At, Active` — write `DAILY` in **Ends At** for a deal that counts down to midnight every day, or `2026-12-31 18:00` for a fixed end (IST) |
| Reviews | `SKU, Author, Rating (1–5), Title, Body, Verified, Date` |
| Settings | `Key, Value` — `logo_url`, `announcement`, `free_gifts`, `finance_partners`, `brands`, `phone`, `whatsapp`, `address`, `instagram_url`, … (full list on `/admin/sync`) |

Until a sheet is connected, GitHub Pages reads the CSV files in `catalog/` (edit them on GitHub for a quick update), and server mode runs the bundled demo catalogue (31 products, 39 reviews, 6 deals).

### 3. Run with a database instead

```bash
npm install
cp .env.example .env     # set DATABASE_URL
npm run dev              # migrations + demo seed run automatically on start
```

Or deploy from the repo: Render picks up [`render.yaml`](render.yaml) (web service + Postgres), or build the [`Dockerfile`](Dockerfile). Open `/admin/sync` (linked as *Store admin* in the footer) for sync status, CSV templates and paste-import.

## Local commands

```bash
npx tsc --noEmit                                             # type check
npm run build && npm run start                               # server mode on :3000
NEXT_PUBLIC_STATIC_BUILD=true NEXT_PUBLIC_BASE_PATH=/repo \
  npx next build                                             # static export to out/
```

## Project layout

```
src/app/            pages (home, products, product, checkout, admin)
src/app/api/        server-only route handlers (route.api.ts — excluded from static builds)
src/components/     UI (header with cartoon marquee, cart drawer, product cards…)
src/lib/            catalogue, Google Sheet parsing, sync, cart, static-host helpers
src/data/           demo catalogue (products, reviews, deals, settings)
src/db/             Drizzle schema + connection
catalog/            CSV templates — also the default live catalogue on GitHub Pages
drizzle/            generated SQL migrations (applied on server start)
public/images/      product and campaign photography
.github/workflows/  Pages deploy + CI
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (proxies /api + /realtime to localhost:3001)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build locally

docker compose up --build -d   # Full self-hosted stack → http://localhost:8080/coffee/
                               # (auto-merges docker-compose.override.yml = dev ports)
docker compose -f docker-compose.yml up -d --build   # Production topology (Synology)
```

No test suite exists in this project.

## Architecture

**Stack:** React 19 + Vite, Tailwind CSS 4, Framer Motion, React Router DOM. Self-hosted via Docker Compose — no external services.

**Docker Compose services:**
- `db` — standard `postgres:17-alpine` (multi-arch, un-pinned). On the `backend` network only (`internal: true` — no host port, no outbound route in production).
- `api` — Node/Express + Prisma backend in [server/](server/), pinned `linux/amd64`. Bridges the `backend` and `frontend` networks. Runs `prisma migrate deploy` on start (creates tables + triggers + seed on first boot), then serves REST under `/api/*` and a WebSocket at `/realtime`.
- `web` — nginx serving the Vite build at `/coffee/` on host port **8080** (the only published port), pinned `linux/amd64`, proxying `/api` and `/realtime` to `api` over the `frontend` network.

**Dev vs prod:** `docker-compose.override.yml` (auto-merged locally) publishes db on host **5433** and api on host **3001** for `npm run dev` / psql / Prisma CLI, and un-internals the `backend` network to allow it. Production (Synology DS920+, Intel x86_64) uses only `docker-compose.yml`.

**Database schema** is owned by Prisma: models in [server/prisma/schema.prisma](server/prisma/schema.prisma), DDL in [server/prisma/migrations/](server/prisma/migrations/). Postgres-specific pieces (order_number sequence starting at 100, `notify_table_change()` triggers, `factory_reset()` function, the `menu_items_default` seed data) live as raw SQL in the migration files. Schema changes = new Prisma migration; keep Prisma field names snake_case where columns are snake_case so REST and realtime payloads expose identical keys.

**Realtime** is built on Postgres LISTEN/NOTIFY: triggers on `menu_items` and `orders` `pg_notify` a JSON payload `{table, eventType: INSERT|UPDATE|DELETE, new, old}` on channel `table_changes`; the api server LISTENs and relays to all `/realtime` WebSocket clients. Payloads over ~7KB arrive id-only (`partial: true`) and are hydrated by the server before broadcast.

**Frontend data access** goes through [src/lib/api.js](src/lib/api.js): REST helpers (`fetchMenu`, `createOrder`, `factoryReset`, …) plus `subscribe(table, handler)` which manages a shared auto-reconnecting WebSocket and returns an unsubscribe function (used directly as useEffect cleanup).

**Routing** (`/coffee/` basename): `/` Home, `/menu` Menu, `/cart` Cart, `/orders` Order Monitor, `/admin` Admin.

**State:** Cart state lives entirely in `CartContext` (useReducer). No other global state. Postgres is the source of truth for orders and menu items.

**Three tables:**
- `menu_items` — seeded with 12 Swedish drinks (from `menu_items_default`). Menu/Home/Admin fetch on mount and subscribe to realtime changes.
- `menu_items_default` — canonical seed copy; `factory_reset()` restores `menu_items` from it and wipes orders. Keep [src/lib/menu.js](src/lib/menu.js) fallback data in sync with it.
- `orders` — `id` (uuid), `order_number` (auto-incrementing from 100), `items` (JSONB array with `{name, size, milk, quantity, price, image}`), `total`, `status` (`pending → preparing → ready → completed`), `created_at`. Order Monitor subscribes to realtime changes.

**Order flow:** Cart POSTs order → response includes `order_number` → shows confirmation screen. Order Monitor page uses optimistic UI for status updates (reverts on API error). Orders disappear from the monitor when status reaches `completed`.

**DrinkCustomizer** is a modal used in both Menu and Home pages — import and render it with `item` and `onClose` props, it handles cart add internally.

**Styling:** Tailwind with a custom coffee color palette defined in [src/index.css](src/index.css) — use `text-espresso`, `bg-cream`, `text-mocha`, `bg-caramel`, `bg-steam`, `bg-latte` etc. rather than raw Tailwind colors.

**Language:** The entire UI is in Swedish.

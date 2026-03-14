# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build locally
```

No test suite exists in this project.

## Architecture

**Stack:** React 19 + Vite, Tailwind CSS 4, Framer Motion, React Router DOM, Supabase JS client. Deployed to GitHub Pages at `/coffee/` base path.

**Supabase** is initialized in [src/lib/supabase.js](src/lib/supabase.js) using a hardcoded publishable key (`sb_publishable_...`) — this is intentional, it is a public frontend key. Never swap it for a service role or admin key.

**Routing** (`/coffee/` basename): `/` Home, `/menu` Menu, `/cart` Cart, `/orders` Order Monitor.

**State:** Cart state lives entirely in `CartContext` (useReducer). No other global state. Supabase is the source of truth for orders and menu items.

**Two Supabase tables:**
- `menu_items` — seeded with 12 Swedish drinks. Menu page fetches on mount and subscribes to realtime INSERT/UPDATE/DELETE.
- `orders` — has `id` (uuid), `order_number` (auto-incrementing from 100), `items` (JSONB array with `{name, size, milk, quantity, price, image}`), `total`, `status` (`pending → preparing → ready → completed`). Order Monitor subscribes to realtime changes.

**Order flow:** Cart inserts order → returns `order_number` → shows confirmation screen. Order Monitor page uses optimistic UI for status updates (reverts on DB error). Orders disappear from the monitor when status reaches `completed`.

**DrinkCustomizer** is a modal used in both Menu and Home pages — import and render it with `item` and `onClose` props, it handles cart add internally.

**Styling:** Tailwind with a custom coffee color palette defined in [src/index.css](src/index.css) — use `text-espresso`, `bg-cream`, `text-mocha`, `bg-caramel`, `bg-steam`, `bg-latte` etc. rather than raw Tailwind colors.

**Language:** The entire UI is in Swedish.

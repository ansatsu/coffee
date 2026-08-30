# ☕ Coffee — self-hosted ordering app

A Swedish coffee ordering app (React + Vite) with a realtime order monitor, fully
self-hosted via Docker Compose:

- **db** — standard `postgres:17` container. Schema is owned by Prisma migrations;
  triggers broadcast row changes over `LISTEN/NOTIFY`.
- **api** — Node/Express + Prisma. REST API plus a `/realtime` WebSocket that relays
  Postgres `NOTIFY` events to browsers.
- **web** — nginx serving the built frontend at `/coffee/`, proxying `/api` and
  `/realtime` to the api container.

## Run it

```bash
docker compose up --build -d
```

Then open <http://localhost:8080/coffee/>.

The database is migrated and seeded automatically on first start (the api container
runs `prisma migrate deploy` before serving).

## Local frontend development

With the stack running (db + api containers), start Vite as usual:

```bash
npm install
npm run dev
```

Vite proxies `/api` and `/realtime` to the api container on `localhost:3001`.

## Backend development

The backend lives in [server/](server/). The Prisma schema is
[server/prisma/schema.prisma](server/prisma/schema.prisma); migrations (including the
realtime triggers, the `factory_reset()` function, and seed data) are in
[server/prisma/migrations/](server/prisma/migrations/).

```bash
cd server
npm install
cp .env.example .env   # points at the compose db on localhost:5433
npx prisma migrate deploy
npm start
```

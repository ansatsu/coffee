# ☕ Coffee — self-hosted ordering app

A Swedish coffee ordering app (React + Vite) with a realtime order monitor, fully
self-hosted via Docker Compose:

- **db** — standard `postgres:17` container. Schema is owned by Prisma migrations;
  triggers broadcast row changes over `LISTEN/NOTIFY`.
- **api** — Node/Express + Prisma. REST API plus a `/realtime` WebSocket that relays
  Postgres `NOTIFY` events to browsers.
- **web** — nginx serving the built frontend at `/coffee/`, proxying `/api` and
  `/realtime` to the api container.

Only `web` is published to the host. The containers are wired over two compose
networks: `frontend` (web ↔ api) and `backend` (api ↔ db, `internal: true` — the
database has no route outside the stack).

## Run it

```bash
docker compose up --build -d
```

Then open <http://localhost:8080/coffee/>.

Everything is provisioned on first boot: the api container runs
`prisma migrate deploy` before serving, which creates the tables, realtime
triggers, and seed data (the 12 default drinks) on an empty database.

## Deploy to Synology (DS920+ / Container Manager)

The built images are pinned `linux/amd64` to match the NAS. Copy the repo to the
NAS and create a Container Manager project pointing at `docker-compose.yml`, or
over SSH:

```bash
docker compose -f docker-compose.yml up -d --build
```

Passing `-f docker-compose.yml` explicitly skips `docker-compose.override.yml`,
which exists only for local development (it publishes db/api ports to the host).
The only port to expose/forward is `web`'s `8080`.

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

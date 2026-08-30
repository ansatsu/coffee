import http from 'node:http'
import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import pg from 'pg'
import { PrismaClient } from '@prisma/client'

const DATABASE_URL = process.env.DATABASE_URL
const PORT = Number(process.env.PORT || 3001)

const prisma = new PrismaClient()
const app = express()
app.use(express.json())

const asyncHandler = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Not found' })
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

// --- Menu ---

const MENU_FIELDS = ['name', 'description', 'price', 'category', 'image', 'popular', 'available']
const pickMenuFields = (body) =>
  Object.fromEntries(MENU_FIELDS.filter((f) => f in body).map((f) => [f, body[f]]))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get(
  '/api/menu',
  asyncHandler(async (req, res) => {
    res.json(await prisma.menuItem.findMany({ orderBy: { id: 'asc' } }))
  })
)

app.post(
  '/api/menu',
  asyncHandler(async (req, res) => {
    const data = pickMenuFields(req.body)
    if (!data.name || typeof data.price !== 'number' || !data.category) {
      return res.status(400).json({ error: 'name, price and category are required' })
    }
    res.status(201).json(await prisma.menuItem.create({ data }))
  })
)

app.patch(
  '/api/menu/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })
    res.json(await prisma.menuItem.update({ where: { id }, data: pickMenuFields(req.body) }))
  })
)

app.delete(
  '/api/menu/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })
    await prisma.menuItem.delete({ where: { id } })
    res.status(204).end()
  })
)

// --- Orders ---

const ACTIVE_STATUSES = ['pending', 'preparing', 'ready']
const ALL_STATUSES = [...ACTIVE_STATUSES, 'completed']

app.get(
  '/api/orders/active',
  asyncHandler(async (req, res) => {
    res.json(
      await prisma.order.findMany({
        where: { status: { in: ACTIVE_STATUSES } },
        orderBy: { created_at: 'asc' },
      })
    )
  })
)

app.post(
  '/api/orders',
  asyncHandler(async (req, res) => {
    const { items, total } = req.body
    if (!Array.isArray(items) || items.length === 0 || typeof total !== 'number') {
      return res.status(400).json({ error: 'items (non-empty array) and total are required' })
    }
    res.status(201).json(await prisma.order.create({ data: { items, total } }))
  })
)

app.patch(
  '/api/orders/:id',
  asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!ALL_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${ALL_STATUSES.join(', ')}` })
    }
    res.json(await prisma.order.update({ where: { id: req.params.id }, data: { status } }))
  })
)

app.post(
  '/api/factory-reset',
  asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT factory_reset()`
    res.json({ ok: true })
  })
)

// --- Realtime: relay Postgres NOTIFY events to WebSocket clients ---

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/realtime' })

function broadcast(text) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(text)
  }
}

async function handleNotification(raw) {
  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return
  }

  // Oversized rows arrive as id-only payloads (see notify_table_change in the
  // migration) — hydrate them before broadcasting.
  if (payload.partial) {
    if (payload.eventType === 'DELETE') {
      payload = { table: payload.table, eventType: 'DELETE', new: null, old: { id: payload.id } }
    } else {
      const row =
        payload.table === 'orders'
          ? await prisma.order.findUnique({ where: { id: payload.id } })
          : await prisma.menuItem.findUnique({ where: { id: payload.id } })
      if (!row) return
      payload = { table: payload.table, eventType: payload.eventType, new: row, old: null }
    }
  }

  broadcast(JSON.stringify(payload))
}

async function runListener() {
  for (;;) {
    const client = new pg.Client({ connectionString: DATABASE_URL })
    try {
      await client.connect()
      client.on('notification', (msg) => {
        handleNotification(msg.payload).catch((err) => console.error('notification error', err))
      })
      await client.query('LISTEN table_changes')
      console.log('Listening on Postgres channel "table_changes"')
      await new Promise((resolve, reject) => {
        client.on('error', reject)
        client.on('end', resolve)
      })
    } catch (err) {
      console.error('Listener connection lost:', err.message)
    }
    try {
      await client.end()
    } catch {
      // already closed
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
}

server.listen(PORT, () => console.log(`coffee-api listening on :${PORT}`))
runListener()

// Self-hosted backend client. REST for CRUD, a shared WebSocket for realtime.
// Realtime payloads mirror the shape the backend broadcasts:
//   { table, eventType: 'INSERT' | 'UPDATE' | 'DELETE', new, old }

const API_BASE = '/api'

async function request(path, options = {}) {
  const { body, ...rest } = options
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`)
  return res.status === 204 ? null : res.json()
}

export const fetchMenu = () => request('/menu')
export const createMenuItem = (data) => request('/menu', { method: 'POST', body: data })
export const updateMenuItem = (id, data) => request(`/menu/${id}`, { method: 'PATCH', body: data })
export const deleteMenuItem = (id) => request(`/menu/${id}`, { method: 'DELETE' })

export const fetchActiveOrders = () => request('/orders/active')
export const createOrder = (data) => request('/orders', { method: 'POST', body: data })
export const updateOrder = (id, data) => request(`/orders/${id}`, { method: 'PATCH', body: data })

export const factoryReset = () => request('/factory-reset', { method: 'POST' })

// --- Realtime ---

const listeners = new Map() // table name -> Set<handler>
let socket = null
let reconnectTimer = null

function wsUrl() {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/realtime`
}

function ensureSocket() {
  if (socket && socket.readyState !== WebSocket.CLOSING && socket.readyState !== WebSocket.CLOSED) return

  socket = new WebSocket(wsUrl())

  socket.onmessage = (event) => {
    let payload
    try {
      payload = JSON.parse(event.data)
    } catch {
      return
    }
    listeners.get(payload.table)?.forEach((handler) => handler(payload))
  }

  socket.onclose = () => {
    socket = null
    if (listeners.size > 0 && !reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        if (listeners.size > 0) ensureSocket()
      }, 2000)
    }
  }

  socket.onerror = () => socket?.close()
}

/**
 * Subscribe to realtime changes for a table. Returns an unsubscribe function
 * (suitable as a useEffect cleanup).
 */
export function subscribe(table, handler) {
  if (!listeners.has(table)) listeners.set(table, new Set())
  listeners.get(table).add(handler)
  ensureSocket()

  return () => {
    const set = listeners.get(table)
    if (set) {
      set.delete(handler)
      if (set.size === 0) listeners.delete(table)
    }
    if (listeners.size === 0 && socket) {
      const s = socket
      socket = null
      s.close()
    }
  }
}

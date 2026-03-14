import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const STATUS_CONFIG = {
  pending: { label: 'Väntar', bg: 'bg-white/10', border: 'border-yellow-400/60', text: 'text-yellow-300', dot: 'bg-yellow-400', card: 'text-white' },
  preparing: { label: 'Förbereds', bg: 'bg-white/10', border: 'border-blue-400/60', text: 'text-blue-300', dot: 'bg-blue-400', card: 'text-white' },
  ready: { label: 'Klar! 🎉', bg: 'bg-white/10', border: 'border-green-400/60', text: 'text-green-300', dot: 'bg-green-400', card: 'text-white' },
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  emoji: ['☕', '☕', '☕', '🫘', '🫘', '✨', '💨'][i % 7],
  x: Math.random() * 100,
  size: 0.7 + Math.random() * 1.1,
  duration: 10 + Math.random() * 14,
  delay: -Math.random() * 20,
}))

function Particle({ x, emoji, size, duration, delay }) {
  return (
    <motion.div
      className="absolute bottom-0 select-none pointer-events-none"
      style={{ left: `${x}%`, fontSize: `${size}rem`, opacity: 0 }}
      animate={{ y: [0, -window.innerHeight - 100], opacity: [0, 0.18, 0.18, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.85, 1] }}
    >
      {emoji}
    </motion.div>
  )
}

const ORBS = [
  { x: '10%', y: '20%', color: 'radial-gradient(circle, rgba(212,165,116,0.18) 0%, transparent 70%)', size: 500, duration: 18, dx: 60, dy: 40 },
  { x: '70%', y: '60%', color: 'radial-gradient(circle, rgba(111,78,55,0.25) 0%, transparent 70%)', size: 600, duration: 22, dx: -50, dy: -60 },
  { x: '50%', y: '10%', color: 'radial-gradient(circle, rgba(196,168,130,0.12) 0%, transparent 70%)', size: 400, duration: 15, dx: 30, dy: 70 },
]

function playOrderChime() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const notes = [880, 660]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.18 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.6)
    osc.start(ctx.currentTime + i * 0.18)
    osc.stop(ctx.currentTime + i * 0.18 + 0.6)
  })
}

export default function OrderMonitor() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return

    supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'preparing', 'ready'])
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setOrders(data)
        setLoading(false)
      })

    const channel = supabase
      .channel('orders-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const o = payload.new
          if (['pending', 'preparing', 'ready'].includes(o.status)) {
            playOrderChime()
            setOrders((prev) => [...prev, o].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
          }
        } else if (payload.eventType === 'UPDATE') {
          const o = payload.new
          if (o.status === 'completed') {
            setOrders((prev) => prev.filter((x) => x.id !== o.id))
          } else {
            setOrders((prev) => prev.map((x) => (x.id === o.id ? o : x)))
          }
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const advanceStatus = async (order) => {
    const map = { pending: 'preparing', preparing: 'ready', ready: 'completed' }
    const next = map[order.status]
    if (!next) return

    if (next === 'completed') {
      setOrders((prev) => prev.filter((x) => x.id !== order.id))
    } else {
      setOrders((prev) => prev.map((x) => (x.id === order.id ? { ...x, status: next } : x)))
    }

    const { error } = await supabase.from('orders').update({ status: next }).eq('id', order.id)

    if (error) {
      setOrders((prev) => {
        const exists = prev.find((x) => x.id === order.id)
        if (exists) return prev.map((x) => (x.id === order.id ? { ...x, status: order.status } : x))
        return [...prev, order].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      })
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0e08 0%, #2c1810 40%, #1e1208 70%, #0f0804 100%)' }}>

      {/* Ambient orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: orb.x, top: orb.y,
            width: orb.size, height: orb.size,
            background: orb.color,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ x: [0, orb.dx, 0], y: [0, orb.dy, 0] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Floating particles */}
      {PARTICLES.map((p) => <Particle key={p.id} {...p} />)}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="font-display text-5xl font-bold text-cream mb-1 drop-shadow-lg">Beställningsöversikt</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-400 inline-block"
            />
            <p className="text-white/40 text-sm tracking-wide">Uppdateras i realtid</p>
          </div>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-white/40 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full"
            />
            Laddar beställningar...
          </div>
        )}

        {!loading && orders.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl mb-6"
            >
              ☕
            </motion.div>
            <p className="text-white/50 text-xl">Inga aktiva beställningar just nu</p>
            <p className="text-white/30 text-sm mt-2">Nya beställningar dyker upp automatiskt</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status]
              const icons = order.items.flatMap((item) =>
                Array.from({ length: item.quantity }, (_, i) => ({ key: `${item.name}-${i}`, emoji: item.image || '☕' }))
              )
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -20 }}
                  transition={{ type: 'spring', damping: 18 }}
                  className={`relative rounded-2xl border-2 p-6 flex flex-col gap-4 backdrop-blur-md ${cfg.bg} ${cfg.border}`}
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                >
                  {/* Pulsing dot for pending */}
                  {order.status === 'pending' && (
                    <span className="absolute top-4 right-4 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
                    </span>
                  )}

                  {/* Order number */}
                  <div className="text-center">
                    <div className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-1">
                      Beställning
                    </div>
                    <div className="font-display text-7xl font-bold text-white leading-none drop-shadow-lg">
                      #{order.order_number}
                    </div>
                  </div>

                  {/* Icon summary */}
                  <div className="flex flex-wrap justify-center gap-2 min-h-[2.5rem]">
                    {icons.map((ic) => (
                      <span key={ic.key} className="text-3xl leading-none drop-shadow">
                        {ic.emoji}
                      </span>
                    ))}
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
                  </div>

                  {order.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => advanceStatus(order)}
                      className="w-full py-2.5 rounded-xl bg-white/15 border border-white/20 text-white font-semibold text-sm hover:bg-white/25 transition-colors cursor-pointer backdrop-blur-sm"
                    >
                      Påbörja
                    </motion.button>
                  )}

                  {order.status === 'preparing' && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => advanceStatus(order)}
                      className="w-full py-2.5 rounded-xl bg-green-500/80 border border-green-400/50 text-white font-semibold text-sm hover:bg-green-500 transition-colors cursor-pointer"
                    >
                      Klar!
                    </motion.button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => advanceStatus(order)}
                      className="w-full py-1.5 rounded-xl border border-green-400/40 text-green-400 text-xs font-medium hover:bg-green-400/10 transition-colors cursor-pointer"
                    >
                      Hämtad — ta bort
                    </button>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

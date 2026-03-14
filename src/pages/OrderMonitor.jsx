import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const STATUS_CONFIG = {
  pending: { label: 'Väntar', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  preparing: { label: 'Förbereds', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', dot: 'bg-blue-500' },
  ready: { label: 'Klar! 🎉', bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', dot: 'bg-green-500' },
}

const NEXT_STATUS = { pending: 'preparing', preparing: 'ready', ready: 'completed' }
const NEXT_LABEL = { pending: 'Påbörja', preparing: 'Klar!', ready: 'Hämtad' }

export default function OrderMonitor() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return

    // Initial fetch — active orders only
    supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'preparing', 'ready'])
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setOrders(data)
        setLoading(false)
      })

    // Real-time subscription
    const channel = supabase
      .channel('orders-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const o = payload.new
          if (['pending', 'preparing', 'ready'].includes(o.status)) {
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
    const next = NEXT_STATUS[order.status]
    if (!next) return

    // Optimistic update
    if (next === 'completed') {
      setOrders((prev) => prev.filter((x) => x.id !== order.id))
    } else {
      setOrders((prev) => prev.map((x) => (x.id === order.id ? { ...x, status: next } : x)))
    }

    const { error } = await supabase.from('orders').update({ status: next }).eq('id', order.id)

    // Revert on failure
    if (error) {
      setOrders((prev) => {
        const exists = prev.find((x) => x.id === order.id)
        if (exists) return prev.map((x) => (x.id === order.id ? { ...x, status: order.status } : x))
        return [...prev, order].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      })
    }
  }

  if (!supabase) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-mocha-light">
        Supabase är inte konfigurerat.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-espresso mb-1">Beställningsöversikt</h1>
        <p className="text-mocha-light text-sm">Uppdateras i realtid</p>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-mocha-light gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-5 h-5 border-2 border-mocha border-t-transparent rounded-full"
          />
          Laddar beställningar...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <div className="text-6xl mb-4">☕</div>
          <p className="text-mocha-light text-lg">Inga aktiva beställningar just nu</p>
          <p className="text-mocha-light text-sm mt-1">Nya beställningar dyker upp automatiskt</p>
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
                className={`relative rounded-2xl border-2 p-6 flex flex-col gap-4 ${cfg.bg} ${cfg.border}`}
              >
                {/* Pulsing dot for pending */}
                {order.status === 'pending' && (
                  <span className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
                  </span>
                )}

                {/* Order number — big and bold */}
                <div className="text-center">
                  <div className="text-xs font-semibold tracking-widest uppercase text-mocha-light mb-1">
                    Beställning
                  </div>
                  <div className="font-display text-7xl font-bold text-espresso leading-none">
                    #{order.order_number}
                  </div>
                </div>

                {/* Icon-only item summary */}
                <div className="flex flex-wrap justify-center gap-2 min-h-[2.5rem]">
                  {icons.map((ic) => (
                    <span key={ic.key} className="text-3xl leading-none" title={ic.key.split('-')[0]}>
                      {ic.emoji}
                    </span>
                  ))}
                </div>

                {/* Status badge */}
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
                </div>

                {/* Advance button — staff control */}
                {NEXT_STATUS[order.status] && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => advanceStatus(order)}
                    className="w-full py-2.5 rounded-xl bg-espresso text-cream font-semibold text-sm hover:bg-espresso-light transition-colors cursor-pointer"
                  >
                    {NEXT_LABEL[order.status]}
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

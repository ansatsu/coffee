import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
  espresso: 'Espresso',
  latte: 'Lattes',
  mocha: 'Mochas',
  cold: 'Kalla Drycker',
  tea: 'Te',
  specialty: 'Specialitet',
}

export default function Admin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    supabase
      .from('menu_items')
      .select('*')
      .order('id')
      .then(({ data }) => {
        if (data) setItems(data)
        setLoading(false)
      })

    const channel = supabase
      .channel('admin-menu')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, (payload) => {
        setItems((prev) => prev.map((i) => (i.id === payload.new.id ? payload.new : i)))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const toggleAvailable = async (item) => {
    const next = !item.available
    setToggling(item.id)

    // Optimistic
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: next } : i)))

    const { error } = await supabase
      .from('menu_items')
      .update({ available: next })
      .eq('id', item.id)

    if (error) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: item.available } : i)))
      toast.error('Kunde inte uppdatera drycken.')
    } else {
      toast.success(`${item.name} är nu ${next ? 'tillgänglig' : 'slutsåld'}.`, {
        style: { background: '#2c1810', color: '#f5f0e8', borderRadius: '12px' },
      })
    }

    setToggling(null)
  }

  // Group by category
  const grouped = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-espresso mb-1">Menyhantering</h1>
        <p className="text-mocha-light text-sm">Slå av och på drycker direkt — uppdateras i realtid för kunder.</p>
      </motion.div>

      {loading && (
        <div className="flex items-center gap-3 py-20 justify-center text-mocha-light">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-5 h-5 border-2 border-mocha border-t-transparent rounded-full"
          />
          Laddar meny...
        </div>
      )}

      <div className="flex flex-col gap-8">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-mocha-light mb-3">
              {CATEGORY_LABELS[category] || category}
            </h2>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {categoryItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className={`flex items-center gap-4 bg-steam rounded-xl px-4 py-3 transition-opacity ${!item.available ? 'opacity-50' : ''}`}
                  >
                    <span className="text-3xl">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-espresso">{item.name}</span>
                        {!item.available && (
                          <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full font-medium">
                            Slutsåld
                          </span>
                        )}
                      </div>
                      <span className="text-mocha-light text-sm">{item.price} kr</span>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleAvailable(item)}
                      disabled={toggling === item.id}
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
                      style={{ backgroundColor: item.available ? '#6f4e37' : '#d1c4b8' }}
                    >
                      <motion.span
                        layout
                        animate={{ x: item.available ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="pointer-events-none inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow"
                      />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

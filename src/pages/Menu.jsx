import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch } from 'react-icons/fi'
import MenuCard from '../components/MenuCard'
import { defaultMenu, categories } from '../lib/menu'
import { supabase } from '../lib/supabase'

export default function Menu() {
  const [menu, setMenu] = useState(defaultMenu)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!supabase) return

    // Initial fetch
    supabase.from('menu_items').select('*').order('id').then(({ data, error }) => {
      if (!error && data?.length) setMenu(data)
    })

    // Realtime — reflect any menu changes live
    const channel = supabase
      .channel('menu-items')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'menu_items' }, (payload) => {
        setMenu((prev) => [...prev, payload.new])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, (payload) => {
        setMenu((prev) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'menu_items' }, (payload) => {
        setMenu((prev) => prev.filter((item) => item.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = menu.filter((item) => {
    const matchCategory = category === 'all' || item.category === category
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-4xl font-bold text-espresso mb-2">Vår Meny</h1>
        <p className="text-mocha-light">Skapad med omsorg, serverad med värme</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-md mx-auto mb-6"
      >
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-mocha-light" />
          <input
            type="text"
            placeholder="Sök drycker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-steam border border-cream-dark focus:border-caramel focus:outline-none transition-colors text-espresso"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-2 mb-8 justify-center flex-wrap"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              category === cat.id
                ? 'bg-espresso text-cream'
                : 'bg-cream-dark text-mocha hover:bg-latte-light'
            }`}
          >
            {cat.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, i) => (
          <MenuCard key={item.id} item={item} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-mocha-light"
        >
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg">Inga drycker hittades. Prova en annan sökning!</p>
        </motion.div>
      )}
    </div>
  )
}

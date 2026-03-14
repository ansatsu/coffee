import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import MenuItemForm from '../components/MenuItemForm'
import DeleteConfirm from '../components/DeleteConfirm'

const CATEGORY_LABELS = {
  espresso: 'Espresso',
  latte: 'Lattes',
  mocha: 'Mochas',
  cold: 'Kalla Drycker',
  tea: 'Te',
  specialty: 'Specialitet',
}

const CATEGORY_ORDER = ['espresso', 'latte', 'mocha', 'cold', 'tea', 'specialty']

export default function Admin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  // Modal state
  const [formItem, setFormItem] = useState(undefined) // undefined = closed, null = new, item = edit
  const [deleteItem, setDeleteItem] = useState(null)

  useEffect(() => {
    supabase
      .from('menu_items')
      .select('*')
      .order('id')
      .then(({ data }) => {
        if (data) setItems(data)
        setLoading(false)
      })

    // Realtime: INSERT, UPDATE, DELETE — admin list stays live across sessions
    const channel = supabase
      .channel('admin-menu')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'menu_items' }, (payload) => {
        setItems((prev) => {
          // Avoid duplicates (if the insert came from this session, onSaved already added it)
          if (prev.some((i) => i.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, (payload) => {
        setItems((prev) => prev.map((i) => (i.id === payload.new.id ? payload.new : i)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'menu_items' }, (payload) => {
        setItems((prev) => prev.filter((i) => i.id !== Number(payload.old.id)))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const toggleAvailable = async (item) => {
    const next = !item.available
    setToggling(item.id)

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

  // Called when MenuItemForm saves successfully
  const handleSaved = (savedItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id)
      if (exists) return prev.map((i) => (i.id === savedItem.id ? savedItem : i))
      return [...prev, savedItem]
    })
  }

  // Called when DeleteConfirm deletes successfully
  const handleDeleted = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  // Group and sort by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  // Any categories not in CATEGORY_ORDER
  items.forEach((item) => {
    if (!CATEGORY_ORDER.includes(item.category)) {
      grouped[item.category] = grouped[item.category] || []
      if (!grouped[item.category].some((i) => i.id === item.id)) {
        grouped[item.category].push(item)
      }
    }
  })

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-espresso mb-1">Menyhantering</h1>
            <p className="text-mocha-light text-sm">
              Lägg till, redigera och slå av drycker — uppdateras i realtid för kunder.
            </p>
          </div>
          <button
            onClick={() => setFormItem(null)}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-espresso text-cream rounded-xl font-semibold text-sm hover:bg-espresso/90 transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            Ny produkt
          </button>
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-mocha-light">
                  {CATEGORY_LABELS[category] || category}
                </h2>
                <span className="text-xs text-mocha-light/60">{categoryItems.length} st</span>
              </div>
              <div className="flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                  {categoryItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className={`flex items-center gap-4 bg-steam rounded-xl px-4 py-3 transition-opacity ${!item.available ? 'opacity-50' : ''}`}
                    >
                      <span className="text-3xl">{item.image}</span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-espresso">{item.name}</span>
                          {item.popular && (
                            <span className="text-xs bg-caramel/30 text-mocha px-2 py-0.5 rounded-full font-medium">
                              Populär
                            </span>
                          )}
                          {!item.available && (
                            <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full font-medium">
                              Slutsåld
                            </span>
                          )}
                        </div>
                        <span className="text-mocha-light text-sm">{item.price} kr</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => setFormItem(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-latte text-mocha-light hover:text-espresso transition-colors text-sm"
                          title="Redigera"
                        >
                          ✎
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-danger/10 text-mocha-light hover:text-danger transition-colors text-sm"
                          title="Ta bort"
                        >
                          🗑
                        </button>

                        {/* Available toggle */}
                        <button
                          onClick={() => toggleAvailable(item)}
                          disabled={toggling === item.id}
                          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
                          style={{ backgroundColor: item.available ? '#6f4e37' : '#d1c4b8' }}
                          title={item.available ? 'Markera som slutsåld' : 'Gör tillgänglig'}
                        >
                          <motion.span
                            layout
                            animate={{ x: item.available ? 20 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="pointer-events-none inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow"
                          />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-mocha-light"
          >
            <p className="text-4xl mb-3">☕</p>
            <p className="font-medium">Inga produkter i menyn ännu.</p>
            <button
              onClick={() => setFormItem(null)}
              className="mt-4 text-sm text-caramel hover:underline"
            >
              Lägg till den första
            </button>
          </motion.div>
        )}
      </div>

      {/* Create / Edit form modal */}
      <AnimatePresence>
        {formItem !== undefined && (
          <MenuItemForm
            key={formItem?.id ?? 'new'}
            item={formItem}
            onClose={() => setFormItem(undefined)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteItem && (
          <DeleteConfirm
            key={deleteItem.id}
            item={deleteItem}
            onClose={() => setDeleteItem(null)}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>
    </>
  )
}

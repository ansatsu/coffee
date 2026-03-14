import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const EMOJI_OPTIONS = [
  // Coffee classics
  '☕', '🍵', '🧋', '🥤', '🍶', '🫖',
  // Dairy & cold
  '🥛', '🧊', '🍦', '🧃', '🫗', '🍹',
  // Sweet treats
  '🍰', '🥐', '🍩', '🍪', '🧁', '🍫',
  '🍮', '🍡', '🍬', '🍭', '🎂', '🧇',
  // Fruit & flavors
  '🍓', '🫐', '🍋', '🍊', '🍇', '🥥',
  '🍌', '🍒', '🍑', '🍎', '🍍', '🥭',
  // Plants & spices
  '🌿', '🌱', '🍃', '🌾', '🌰', '🫛',
  '🫚', '🍯', '🥜', '🧄', '🌶️', '🫙',
  // Weather & effects
  '🔥', '❄️', '⚡', '🌊', '💨', '🌈',
  '⭐', '✨', '🌟', '💫', '🎇', '🎆',
  // Wacky & fun
  '💩', '👻', '🤡', '🥴', '😵', '🤯',
  '🦄', '🐸', '🐧', '🦊', '🐮', '🦋',
  '🚀', '👽', '🤖', '💀', '🎃', '🧨',
  '🪄', '🎩', '🥸', '🫠', '😤', '🤬',
]

const CATEGORIES = [
  { value: 'espresso', label: 'Espresso' },
  { value: 'latte', label: 'Latte' },
  { value: 'mocha', label: 'Mocha' },
  { value: 'cold', label: 'Kalla Drycker' },
  { value: 'tea', label: 'Te' },
  { value: 'specialty', label: 'Specialitet' },
]

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'espresso',
  image: '☕',
  popular: false,
  available: true,
}

export default function MenuItemForm({ item, onClose, onSaved }) {
  const isEdit = !!item
  const [form, setForm] = useState(
    isEdit
      ? {
          name: item.name,
          description: item.description,
          price: String(item.price),
          category: item.category,
          image: item.image,
          popular: item.popular,
          available: item.available,
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const emojiPickerRef = useRef(null)

  // Close picker when clicking outside
  useEffect(() => {
    if (!emojiPickerOpen) return
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setEmojiPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [emojiPickerOpen])

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Namn krävs'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Ange ett giltigt pris'
    if (!form.category) e.category = 'Välj en kategori'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setSaving(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image || '☕',
      popular: form.popular,
      available: form.available,
    }

    let result
    if (isEdit) {
      result = await supabase.from('menu_items').update(payload).eq('id', item.id).select().single()
    } else {
      result = await supabase.from('menu_items').insert(payload).select().single()
    }

    setSaving(false)

    if (result.error) {
      toast.error('Något gick fel. Försök igen.')
      return
    }

    toast.success(isEdit ? `${payload.name} uppdaterad!` : `${payload.name} tillagd i menyn!`, {
      style: { background: '#2c1810', color: '#f5f0e8', borderRadius: '12px' },
    })

    onSaved(result.data)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="w-full max-w-lg bg-cream rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-steam">
            <h2 className="font-display text-xl font-bold text-espresso">
              {isEdit ? 'Redigera produkt' : 'Ny produkt'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-steam text-mocha-light hover:text-espresso transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
            {/* Emoji + Name row */}
            <div className="flex gap-3 items-start">
              {/* Emoji picker */}
              <div className="flex flex-col gap-1 relative" ref={emojiPickerRef}>
                <label className="text-xs font-semibold text-mocha-light uppercase tracking-wide">Ikon</label>
                <button
                  type="button"
                  onClick={() => setEmojiPickerOpen((o) => !o)}
                  className="w-16 h-12 text-2xl flex items-center justify-center bg-steam rounded-xl border border-transparent hover:border-caramel transition-colors focus:outline-none focus:border-caramel"
                  title="Välj ikon"
                >
                  {form.image || '☕'}
                </button>
                <AnimatePresence>
                  {emojiPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 z-10 bg-cream rounded-xl shadow-xl border border-steam p-2 w-64"
                    >
                      <p className="text-xs text-mocha-light px-1 pb-1.5 font-medium">Välj en ikon</p>
                      <div className="grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              set('image', emoji)
                              setEmojiPickerOpen(false)
                            }}
                            className={`h-8 w-8 text-lg flex items-center justify-center rounded-lg transition-colors ${
                              form.image === emoji
                                ? 'bg-espresso/15 ring-1 ring-espresso/30'
                                : 'hover:bg-steam'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Name */}
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs font-semibold text-mocha-light uppercase tracking-wide">Namn *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Klassisk Espresso"
                  className={`w-full h-12 px-3 bg-steam rounded-xl border ${errors.name ? 'border-danger' : 'border-transparent'} focus:outline-none focus:border-caramel text-espresso placeholder-mocha-light/50`}
                />
                {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-mocha-light uppercase tracking-wide">Beskrivning</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="En kort beskrivning av drycken..."
                rows={2}
                className="w-full px-3 py-2.5 bg-steam rounded-xl border border-transparent focus:outline-none focus:border-caramel text-espresso placeholder-mocha-light/50 resize-none"
              />
            </div>

            {/* Price + Category row */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 w-28">
                <label className="text-xs font-semibold text-mocha-light uppercase tracking-wide">Pris (kr) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="45"
                  min="1"
                  className={`w-full h-12 px-3 bg-steam rounded-xl border ${errors.price ? 'border-danger' : 'border-transparent'} focus:outline-none focus:border-caramel text-espresso placeholder-mocha-light/50`}
                />
                {errors.price && <p className="text-xs text-danger">{errors.price}</p>}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs font-semibold text-mocha-light uppercase tracking-wide">Kategori *</label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className={`w-full h-12 px-3 bg-steam rounded-xl border ${errors.category ? 'border-danger' : 'border-transparent'} focus:outline-none focus:border-caramel text-espresso appearance-none`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggles row */}
            <div className="flex gap-4 pt-1">
              {/* Populär toggle */}
              <button
                type="button"
                onClick={() => set('popular', !form.popular)}
                className="flex items-center gap-2 px-4 py-2.5 bg-steam rounded-xl hover:bg-steam/80 transition-colors"
              >
                <div
                  className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
                  style={{ backgroundColor: form.popular ? '#6f4e37' : '#d1c4b8' }}
                >
                  <motion.span
                    animate={{ x: form.popular ? 16 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="pointer-events-none inline-block h-3 w-3 mt-0.5 rounded-full bg-white shadow"
                  />
                </div>
                <span className="text-sm font-medium text-espresso">Populär</span>
              </button>

              {/* Tillgänglig toggle */}
              <button
                type="button"
                onClick={() => set('available', !form.available)}
                className="flex items-center gap-2 px-4 py-2.5 bg-steam rounded-xl hover:bg-steam/80 transition-colors"
              >
                <div
                  className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
                  style={{ backgroundColor: form.available ? '#6f4e37' : '#d1c4b8' }}
                >
                  <motion.span
                    animate={{ x: form.available ? 16 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="pointer-events-none inline-block h-3 w-3 mt-0.5 rounded-full bg-white shadow"
                  />
                </div>
                <span className="text-sm font-medium text-espresso">Tillgänglig</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl border border-mocha/20 text-mocha font-medium hover:bg-steam transition-colors"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-12 rounded-xl bg-espresso text-cream font-semibold hover:bg-espresso/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-cream border-t-transparent rounded-full"
                    />
                    Sparar...
                  </>
                ) : isEdit ? (
                  'Spara ändringar'
                ) : (
                  'Lägg till'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

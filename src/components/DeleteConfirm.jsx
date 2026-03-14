import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function DeleteConfirm({ item, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase.from('menu_items').delete().eq('id', item.id)

    if (error) {
      setDeleting(false)
      toast.error('Kunde inte ta bort produkten.')
      return
    }

    toast.success(`${item.name} borttagen från menyn.`, {
      style: { background: '#2c1810', color: '#f5f0e8', borderRadius: '12px' },
    })

    onDeleted(item.id)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="w-full max-w-sm bg-cream rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-4xl">{item.image}</span>
            <h2 className="font-display text-xl font-bold text-espresso">Ta bort produkt?</h2>
            <p className="text-mocha-light text-sm">
              <span className="font-semibold text-mocha">{item.name}</span> tas bort från menyn permanent. Det går inte att ångra.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 h-11 rounded-xl border border-mocha/20 text-mocha font-medium hover:bg-steam transition-colors disabled:opacity-50"
            >
              Avbryt
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 h-11 rounded-xl bg-danger text-white font-semibold hover:bg-danger/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Tar bort...
                </>
              ) : (
                'Ta bort'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

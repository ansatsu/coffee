import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiMinus, FiPlus } from 'react-icons/fi'
import { useState } from 'react'
import { sizes, milkOptions } from '../lib/menu'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function DrinkCustomizer({ item, onClose }) {
  const { addItem } = useCart()
  const [size, setSize] = useState('medium')
  const [milk, setMilk] = useState('whole')
  const [quantity, setQuantity] = useState(1)

  const sizeExtra = sizes.find((s) => s.id === size)?.extra || 0
  const milkExtra = milkOptions.find((m) => m.id === milk)?.extra || 0
  const totalPrice = item.price + sizeExtra + milkExtra

  const handleAdd = () => {
    addItem({
      ...item,
      size,
      milk,
      quantity,
      totalPrice,
    })
    toast.success(`${item.name} har lagts i varukorgen!`, {
      icon: item.image,
      style: {
        background: '#2c1810',
        color: '#f5f0e8',
        borderRadius: '12px',
      },
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-steam w-full max-w-md rounded-2xl sm:rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-4xl">{item.image}</span>
              <h3 className="font-display text-xl font-semibold text-espresso mt-2">
                {item.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-mocha-light hover:text-espresso p-1 cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Size */}
          <div className="mb-4">
            <label className="text-sm font-medium text-mocha mb-2 block">Storlek</label>
            <div className="flex gap-2">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    size === s.id
                      ? 'bg-espresso text-cream'
                      : 'bg-cream-dark text-mocha hover:bg-latte-light'
                  }`}
                >
                  {s.label}
                  {s.extra > 0 && (
                    <span className="block text-xs opacity-70">+{s.extra.toFixed(2)} kr</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Milk */}
          <div className="mb-5">
            <label className="text-sm font-medium text-mocha mb-2 block">Mjölk</label>
            <div className="grid grid-cols-3 gap-2">
              {milkOptions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMilk(m.id)}
                  className={`py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    milk === m.id
                      ? 'bg-espresso text-cream'
                      : 'bg-cream-dark text-mocha hover:bg-latte-light'
                  }`}
                >
                  {m.label}
                  {m.extra > 0 && (
                    <span className="block text-xs opacity-70">+{m.extra.toFixed(2)} kr</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-mocha">Antal</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-cream-dark p-2 rounded-full hover:bg-latte-light transition-colors cursor-pointer"
              >
                <FiMinus size={14} />
              </button>
              <span className="font-semibold text-lg w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="bg-cream-dark p-2 rounded-full hover:bg-latte-light transition-colors cursor-pointer"
              >
                <FiPlus size={14} />
              </button>
            </div>
          </div>

          {/* Add button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="w-full bg-espresso text-cream py-3.5 rounded-xl font-semibold text-base hover:bg-espresso-light transition-colors cursor-pointer"
          >
            Lägg till {quantity} — {(totalPrice * quantity).toFixed(2)} kr
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

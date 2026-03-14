import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { sizes, milkOptions } from '../lib/menu'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const [placing, setPlacing] = useState(false)

  const handlePlaceOrder = async () => {
    if (!items.length) return
    setPlacing(true)

    if (supabase) {
      const { error } = await supabase.from('orders').insert({
        items: items.map((i) => ({
          name: i.name,
          size: i.size,
          milk: i.milk,
          quantity: i.quantity,
          price: i.totalPrice,
        })),
        total: totalPrice,
        status: 'pending',
      })

      if (error) {
        toast.error('Det gick inte att lägga beställningen. Försök igen.')
        setPlacing(false)
        return
      }
    }

    clearCart()
    setPlacing(false)
    toast.success('Beställning lagd! Ditt kaffe förbereds ☕', {
      duration: 4000,
      style: {
        background: '#2c1810',
        color: '#f5f0e8',
        borderRadius: '12px',
      },
    })
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="font-display text-2xl font-semibold text-espresso mb-3">
            Din varukorg är tom
          </h2>
          <p className="text-mocha-light mb-8">
            Det verkar som att du inte har lagt till några drycker än
          </p>
          <Link to="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-espresso text-cream px-6 py-3 rounded-full font-semibold flex items-center gap-2 mx-auto hover:bg-espresso-light transition-colors cursor-pointer"
            >
              Bläddra i menyn <FiArrowRight />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-espresso flex items-center gap-3">
            <FiShoppingBag className="text-mocha" /> Din Varukorg
          </h1>
          <button
            onClick={clearCart}
            className="text-danger text-sm font-medium hover:underline cursor-pointer"
          >
            Rensa allt
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.cartId}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="bg-steam rounded-xl p-4 mb-3 flex items-center gap-4"
            >
              <span className="text-3xl">{item.image}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-espresso truncate">{item.name}</h3>
                <p className="text-mocha-light text-sm">
                  {sizes.find((s) => s.id === item.size)?.label} ·{' '}
                  {milkOptions.find((m) => m.id === item.milk)?.label}
                </p>
                <span className="text-mocha font-medium text-sm">
                  ${item.totalPrice.toFixed(2)} styck
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    item.quantity > 1
                      ? updateQuantity(item.cartId, item.quantity - 1)
                      : removeItem(item.cartId)
                  }
                  className="bg-cream-dark p-1.5 rounded-full hover:bg-latte-light transition-colors cursor-pointer"
                >
                  <FiMinus size={12} />
                </button>
                <span className="font-semibold w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                  className="bg-cream-dark p-1.5 rounded-full hover:bg-latte-light transition-colors cursor-pointer"
                >
                  <FiPlus size={12} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.cartId)}
                className="text-mocha-light hover:text-danger transition-colors p-1 cursor-pointer"
              >
                <FiTrash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Totals */}
        <motion.div layout className="bg-espresso rounded-xl p-5 mt-6 text-cream">
          <div className="flex justify-between mb-2 text-cream/70">
            <span>Delsumma</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 text-cream/70">
            <span>Moms</span>
            <span>${(totalPrice * 0.08).toFixed(2)}</span>
          </div>
          <div className="border-t border-cream/20 pt-3 flex justify-between text-lg font-semibold">
            <span>Totalt</span>
            <span>${(totalPrice * 1.08).toFixed(2)}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full mt-4 bg-caramel text-espresso py-3.5 rounded-xl font-semibold text-base hover:bg-latte transition-colors cursor-pointer disabled:opacity-50"
          >
            {placing ? 'Beställer...' : 'Lägg beställning'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

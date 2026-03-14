import { motion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'
import { useState } from 'react'
import DrinkCustomizer from './DrinkCustomizer'

export default function MenuCard({ item, index }) {
  const [showCustomizer, setShowCustomizer] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        whileHover={{ y: -4 }}
        className="group bg-steam rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        {item.popular && (
          <span className="absolute top-3 right-3 bg-caramel/20 text-mocha text-xs font-semibold px-2.5 py-1 rounded-full">
            Populär
          </span>
        )}

        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {item.image}
        </div>

        <h3 className="font-display text-lg font-semibold text-espresso mb-1">
          {item.name}
        </h3>
        <p className="text-mocha-light text-sm leading-relaxed mb-4">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-espresso">
            {item.price.toFixed(2)} kr
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustomizer(true)}
            className="bg-espresso text-cream px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-espresso-light transition-colors cursor-pointer"
          >
            <FiPlus /> Lägg till
          </motion.button>
        </div>
      </motion.div>

      {showCustomizer && (
        <DrinkCustomizer item={item} onClose={() => setShowCustomizer(false)} />
      )}
    </>
  )
}

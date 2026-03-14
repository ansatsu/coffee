import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiStar } from 'react-icons/fi'
import SteamAnimation from '../components/SteamAnimation'
import { defaultMenu } from '../lib/menu'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

export default function Home() {
  const popular = defaultMenu.filter((item) => item.popular).slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <SteamAnimation />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-7xl sm:text-8xl mb-6"
        >
          ☕
        </motion.div>
        <motion.h1
          {...fadeUp}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-display text-4xl sm:text-6xl font-bold text-espresso leading-tight mb-4"
        >
          Warmth in
          <br />
          <span className="text-mocha italic">every sip</span>
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-mocha-light text-lg sm:text-xl max-w-md mx-auto mb-8 leading-relaxed"
        >
          Handcrafted drinks made with love, served with a smile.
          Order ahead and skip the line.
        </motion.p>
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-espresso text-cream px-8 py-3.5 rounded-full text-base font-semibold flex items-center gap-2 mx-auto sm:mx-0 hover:bg-espresso-light transition-colors cursor-pointer"
            >
              Browse Menu <FiArrowRight />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Popular section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 text-caramel mb-2">
            <FiStar /> <span className="text-sm font-semibold uppercase tracking-wider">Customer Favorites</span> <FiStar />
          </div>
          <h2 className="font-display text-3xl font-semibold text-espresso">
            Most loved drinks
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popular.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-steam rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-5xl mb-3">{item.image}</div>
              <h3 className="font-display font-semibold text-espresso mb-1">{item.name}</h3>
              <p className="text-mocha-light text-sm mb-2">{item.description}</p>
              <span className="text-mocha font-semibold">${item.price.toFixed(2)}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-cream-dark text-espresso px-6 py-3 rounded-full font-medium flex items-center gap-2 mx-auto hover:bg-latte-light transition-colors cursor-pointer"
            >
              View Full Menu <FiArrowRight />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Cozy banner */}
      <section className="bg-espresso text-cream py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-semibold mb-4 text-cream">
              Open daily, 7am — 8pm
            </h2>
            <p className="text-cream/60 max-w-lg mx-auto">
              Whether you&apos;re grabbing your morning pick-me-up or settling in for an
              afternoon study session, we&apos;ve got a cozy spot and a warm cup waiting for you.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

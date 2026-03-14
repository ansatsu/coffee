import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiStar } from 'react-icons/fi'
import SteamAnimation from '../components/SteamAnimation'
import { defaultMenu } from '../lib/menu'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const floatingItems = [
  { emoji: '☕', x: '8%',  y: '12%', size: '2rem',  duration: 6,   delay: 0 },
  { emoji: '🫘', x: '88%', y: '8%',  size: '1.5rem', duration: 7,   delay: 1 },
  { emoji: '🫘', x: '5%',  y: '60%', size: '1.2rem', duration: 8,   delay: 2 },
  { emoji: '✨', x: '92%', y: '55%', size: '1.4rem', duration: 5,   delay: 0.5 },
  { emoji: '🫘', x: '80%', y: '80%', size: '1.6rem', duration: 9,   delay: 1.5 },
  { emoji: '✨', x: '15%', y: '85%', size: '1.1rem', duration: 6.5, delay: 3 },
  { emoji: '🫘', x: '50%', y: '5%',  size: '1.3rem', duration: 7.5, delay: 2.5 },
  { emoji: '✨', x: '70%', y: '20%', size: '1rem',   duration: 5.5, delay: 1 },
]

export default function Home() {
  const popular = defaultMenu.filter((item) => item.popular).slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: [
              'radial-gradient(ellipse 80% 60% at 50% 0%, #e8d5b7 0%, #faf6f0 60%, #f5f0e8 100%)',
              'radial-gradient(ellipse 80% 60% at 40% 10%, #dfc9a0 0%, #f5f0e8 60%, #faf6f0 100%)',
              'radial-gradient(ellipse 80% 60% at 60% 5%,  #e8d5b7 0%, #faf6f0 60%, #f5f0e8 100%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />

        {/* Floating background elements */}
        {floatingItems.map((item, i) => (
          <motion.div
            key={i}
            className="absolute select-none pointer-events-none"
            style={{ left: item.x, top: item.y, fontSize: item.size, opacity: 0.18 }}
            animate={{ y: [-10, 10, -10], rotate: [-8, 8, -8], scale: [1, 1.1, 1] }}
            transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
          >
            {item.emoji}
          </motion.div>
        ))}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 text-center">
          {/* Big mug */}
          <div className="relative inline-block mb-6">
            <SteamAnimation />

            {/* Glow ring behind mug */}
            <motion.div
              className="absolute inset-0 rounded-full -z-10 blur-2xl"
              style={{ background: 'radial-gradient(circle, rgba(180,120,60,0.25) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 120, damping: 10 }}
              whileHover={{ scale: 1.12, rotate: [0, -5, 5, -3, 0] }}
              style={{ fontSize: 'clamp(6rem, 18vw, 10rem)', lineHeight: 1, display: 'block', cursor: 'default' }}
            >
              ☕
            </motion.div>

            {/* Orbiting sparkles */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute text-xl pointer-events-none"
                style={{ top: '50%', left: '50%' }}
                animate={{
                  x: Math.cos((i / 3) * Math.PI * 2) * 80,
                  y: Math.sin((i / 3) * Math.PI * 2) * 80,
                  rotate: 360,
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 1.2,
                }}
              >
                ✨
              </motion.span>
            ))}
          </div>

          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="font-display text-5xl sm:text-7xl font-bold text-espresso leading-tight mb-4"
          >
            Värme i
            <br />
            <span className="text-mocha italic">varje klunk</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-mocha-light text-lg sm:text-xl max-w-md mx-auto mb-10 leading-relaxed"
          >
            Hantverksdrycker gjorda med kärlek, serverade med ett leende.
            Förbeställ och hoppa över kön.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/menu">
              <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                className="bg-espresso text-cream px-10 py-4 rounded-full text-base font-semibold flex items-center gap-2 mx-auto sm:mx-0 hover:bg-espresso-light transition-colors cursor-pointer shadow-lg"
              >
                Bläddra i menyn <FiArrowRight />
              </motion.button>
            </Link>
          </motion.div>
        </div>
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
            <FiStar /> <span className="text-sm font-semibold uppercase tracking-wider">Kundfavoriter</span> <FiStar />
          </div>
          <h2 className="font-display text-3xl font-semibold text-espresso">
            Mest älskade drycker
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
              <span className="text-mocha font-semibold">{item.price} kr</span>
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
              Se hela menyn <FiArrowRight />
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
              Öppet dagligen, 07:00 — 20:00
            </h2>
            <p className="text-cream/60 max-w-lg mx-auto">
              Oavsett om du hämtar din morgonboost eller slår dig ner för en
              eftermiddags studiesession, har vi en mysig plats och en varm kopp som väntar på dig.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

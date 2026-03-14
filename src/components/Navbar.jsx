import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShoppingBag, FiCoffee, FiMenu, FiX, FiSettings } from 'react-icons/fi'
import { MdQrCode2 } from 'react-icons/md'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useCart } from '../context/CartContext'

const SITE_URL = 'https://ansatsu.github.io/coffee/'

export default function Navbar() {
  const { totalItems } = useCart()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const links = [
    { to: '/', label: 'Hem' },
    { to: '/menu', label: 'Meny' },
    { to: '/orders', label: 'Beställningar' },
    { to: '/admin', label: 'Admin' },
    { to: '/cart', label: 'Varukorg' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="sticky top-0 z-50 bg-cream/80 backdrop-blur-lg border-b border-cream-dark"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring' }}>
              <FiCoffee className="text-mocha text-2xl" />
            </motion.div>
            <span className="font-display text-xl font-semibold text-espresso">
              Leo och Liams Mysiga Kaffeböna
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-mocha-light hover:text-espresso transition-colors no-underline font-medium"
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-caramel rounded-full"
                  />
                )}
              </Link>
            ))}

            {/* Admin button */}
            <Link to="/admin">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-full transition-colors ${location.pathname === '/admin' ? 'bg-espresso text-cream' : 'bg-cream-dark text-mocha hover:bg-latte-light'}`}
                title="Admin"
              >
                <FiSettings className="text-lg" />
              </motion.div>
            </Link>

            {/* QR button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQrOpen(true)}
              className="bg-cream-dark text-mocha p-2.5 rounded-full hover:bg-latte-light transition-colors cursor-pointer"
              title="Visa QR-kod"
            >
              <MdQrCode2 className="text-lg" />
            </motion.button>

            <Link to="/cart" className="relative no-underline">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-espresso text-cream p-2.5 rounded-full"
              >
                <FiShoppingBag className="text-lg" />
              </motion.div>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-caramel text-espresso text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQrOpen(true)}
              className="bg-cream-dark text-mocha p-2 rounded-full hover:bg-latte-light transition-colors cursor-pointer"
            >
              <MdQrCode2 size={20} />
            </motion.button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-espresso p-2"
            >
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-cream border-t border-cream-dark"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-mocha hover:text-espresso transition-colors no-underline font-medium py-2"
                  >
                    {link.label}
                    {link.to === '/cart' && totalItems > 0 && (
                      <span className="ml-2 bg-caramel text-espresso text-xs font-bold px-2 py-0.5 rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* QR modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 backdrop-blur-sm p-4"
            onClick={() => setQrOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cream rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full"
            >
              <div className="text-4xl">☕</div>
              <h2 className="font-display text-xl font-semibold text-espresso text-center">
                Skanna &amp; beställ
              </h2>
              <p className="text-mocha-light text-sm text-center">
                Dela med dig av kaffeupplevelsen!
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={SITE_URL}
                  size={200}
                  fgColor="#2c1810"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>
              <p className="text-mocha-light text-xs text-center break-all">{SITE_URL}</p>
              <button
                onClick={() => setQrOpen(false)}
                className="mt-1 text-mocha-light hover:text-espresso transition-colors text-sm cursor-pointer"
              >
                Stäng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

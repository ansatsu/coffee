import { FiCoffee, FiHeart } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/60 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiCoffee className="text-caramel" />
            <span className="font-display text-cream/80">Leo och Liams Mysiga Kaffeböna</span>
          </div>
          <p className="text-sm flex items-center gap-1">
            Gjord med <FiHeart className="text-caramel" /> och massor av kaffe
          </p>
        </div>
      </div>
    </footer>
  )
}

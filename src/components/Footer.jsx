import { FiCoffee, FiHeart } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/60 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiCoffee className="text-caramel" />
            <span className="font-display text-cream/80">The Cozy Bean</span>
          </div>
          <p className="text-sm flex items-center gap-1">
            Made with <FiHeart className="text-caramel" /> and lots of coffee
          </p>
        </div>
      </div>
    </footer>
  )
}

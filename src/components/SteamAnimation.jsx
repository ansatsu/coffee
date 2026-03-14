import { motion } from 'framer-motion'

export default function SteamAnimation() {
  return (
    <div className="relative w-24 h-16 mx-auto">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-1.5 bg-mocha-light/20 rounded-full"
          style={{ left: `${30 + i * 20}%` }}
          animate={{
            height: [8, 40, 8],
            opacity: [0.2, 0.6, 0],
            x: [0, (i - 1) * 8, (i - 1) * 12],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

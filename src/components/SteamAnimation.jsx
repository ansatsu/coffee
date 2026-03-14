import { motion } from 'framer-motion'

export default function SteamAnimation() {
  return (
    <div className="relative w-48 h-28 mx-auto mb-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${15 + i * 17}%`,
            width: i % 2 === 0 ? '10px' : '7px',
            background: 'radial-gradient(ellipse, rgba(180,140,100,0.35), transparent)',
          }}
          animate={{
            height: [10, 60, 10],
            opacity: [0, 0.7, 0],
            x: [0, (i - 2) * 10, (i - 2) * 18],
            scaleX: [1, 1.4, 0.8],
          }}
          transition={{
            duration: 2.8 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.35,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

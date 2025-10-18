import { motion } from 'framer-motion'
export default function SpiralLoader() {
  const dots = 14
  const radius = 40
  return (
    <div className="relative h-16 w-16">
      {[...Array(dots)].map((_, index) => {
        const angle = (index / dots) * (2 * Math.PI)
        const x = radius * Math.cos(angle)
        const y = radius * Math.sin(angle)
        return (
          <motion.div
            key={index}
            className="absolute h-3 w-3 rounded-full bg-gray-500"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: (index / dots) * 1.5,
              ease: 'easeInOut'
            }}
          />
        )
      })}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type Catalog, loadCatalog } from './data/loadCatalog'
import { LandingScene } from './scenes/LandingScene'
import { ShipScene } from './scenes/ShipScene'
import { SkyRoot } from './scenes/SkyRoot'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const scene = useAppStore((s) => s.scene)
  const place = useAppStore((s) => s.place)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCatalog().then(setCatalog).catch((e: Error) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="boot">
        <h2>The star charts could not be loaded</h2>
        <p>{error}</p>
      </div>
    )
  }
  if (!catalog) {
    return (
      <div className="boot">
        <div className="boot-star" />
        <p>Charting the stars…</p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {(scene === 'ship' || scene === 'map') && (
        <motion.div key="ship" className="layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
          <ShipScene />
        </motion.div>
      )}
      {scene === 'landing' && place && (
        <motion.div key="landing" className="layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <LandingScene />
        </motion.div>
      )}
      {scene === 'sky' && place && (
        <motion.div key="sky" className="layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
          <SkyRoot catalog={catalog} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

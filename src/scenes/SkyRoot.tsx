import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { Prince, type Pose } from '../characters/Prince'
import type { Catalog } from '../data/loadCatalog'
import { SkyCanvas } from '../sky/SkyCanvas'
import { SunBlocker } from '../sky/SunBlocker'
import { useAppStore } from '../store/useAppStore'
import { Hud } from '../ui/Hud'
import { InfoModal } from '../ui/InfoModal'
import { Notebook } from '../ui/Notebook'

/** The sky itself, with the traveller standing in the park (park mode only). */
export function SkyRoot({ catalog }: { catalog: Catalog }) {
  const place = useAppStore((s) => s.place)!
  const mode = useAppStore((s) => s.mode)
  return (
    <div className={`sky-root mode-${mode}`}>
      <SkyCanvas catalog={catalog} place={place} mode={mode} />
      <AnimatePresence>{mode === 'park' && <ParkTraveller key="traveller" />}</AnimatePresence>
      <SunBlocker />
      <Hud />
      <Notebook catalog={catalog} />
      <InfoModal catalog={catalog} />
    </div>
  )
}

function ParkTraveller() {
  const notebookOpen = useAppStore((s) => s.notebookOpen)
  const actionPose = useAppStore((s) => s.actionPose)
  const [arrived, setArrived] = useState(false)
  const walker = useRef<HTMLDivElement>(null)
  const played = useRef(false)

  // the traveller steps out of the ship and walks to the middle of the park
  useEffect(() => {
    const el = walker.current
    if (!el) return
    if (played.current) {
      setArrived(true)
      return
    }
    const tween = gsap.fromTo(
      el,
      { x: '-62vw' },
      {
        x: '0vw',
        duration: 3.2,
        ease: 'sine.inOut',
        onComplete: () => {
          played.current = true
          setArrived(true)
        },
      },
    )
    return () => {
      tween.kill()
    }
  }, [])

  const pose: Pose = actionPose ?? (notebookOpen ? 'notebook' : arrived ? 'look' : 'walk')

  return (
    <motion.div className="prince-anchor" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 80 }} transition={{ type: 'spring', stiffness: 160, damping: 22 }}>
      <div ref={walker} className="prince-wrap">
        <Prince pose={pose} />
      </div>
    </motion.div>
  )
}

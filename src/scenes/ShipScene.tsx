import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Prince } from '../characters/Prince'
import { useAppStore } from '../store/useAppStore'
import { MapScene } from './MapScene'
import { WarpField } from './WarpField'

const DESIGN_W = 1600
const DESIGN_H = 900
/** the ship's monitor, in design coordinates */
const MON = { x: 730, y: 150, w: 720, h: 405 }

/**
 * The inside of the spaceship. The big monitor shows the world map; pressing "Begin" zooms the camera into the
 * monitor so the map fills the screen, and "Back to the ship" zooms out again.
 */
export function ShipScene() {
  const scene = useAppStore((s) => s.scene)
  const setScene = useAppStore((s) => s.setScene)
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  const mapBox = useRef<HTMLDivElement>(null)
  const roomRef = useRef<HTMLDivElement>(null)
  const speed = useRef(1)
  const first = useRef(true)

  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  // on a portrait phone the 16:9 room cannot fill the screen, so frame the monitor instead of cropping it away
  const portrait = vp.w < vp.h * 0.8
  const s = portrait ? vp.w / (MON.w + 110) : Math.max(vp.w / DESIGN_W, vp.h / DESIGN_H)
  const ox = portrait ? vp.w / 2 - (MON.x + MON.w / 2) * s : (vp.w - DESIGN_W * s) / 2
  const oy = portrait ? vp.h * 0.6 - MON.y * s : (vp.h - DESIGN_H * s) / 2
  const mon = { x: ox + MON.x * s, y: oy + MON.y * s, w: MON.w * s, h: MON.h * s }

  const full = scene === 'map'

  useLayoutEffect(() => {
    const box = mapBox.current
    const room = roomRef.current
    if (!box || !room) return
    const small = { x: mon.x, y: mon.y, scale: mon.w / vp.w, borderRadius: 14 / (mon.w / vp.w) }
    const big = { x: 0, y: 0, scale: 1, borderRadius: 0 }
    const target = full ? big : small
    gsap.killTweensOf([box, room])
    if (first.current) {
      first.current = false
      gsap.set(box, target)
      return
    }
    gsap.to(box, { ...target, duration: 1.25, ease: 'power3.inOut' })
    // the room itself drifts back and fades while the map takes over
    gsap.to(room, { opacity: full ? 0 : 1, duration: 1.1, ease: 'power2.inOut' })
    gsap.to(speed, { current: full ? 0.25 : 1, duration: 1.2 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full, vp.w, vp.h])

  return (
    <div className="ship">
      <div ref={roomRef} className="room-wrap">
        <div className="room" style={{ width: DESIGN_W, height: DESIGN_H, transform: `translate(${ox}px, ${oy}px) scale(${s})` }}>
          <div className="room-wall" />
          {/* porthole */}
          <div className="porthole">
            <WarpField speedRef={speed} />
            <div className="porthole-earth" />
            <div className="porthole-glass" />
          </div>
          {/* small side window with a looping planet */}
          <div className="porthole small">
            <WarpField speedRef={speed} count={70} />
            <div className="porthole-planet" />
            <div className="porthole-glass" />
          </div>
          {/* monitor frame */}
          <div className="monitor-frame" style={{ left: MON.x - 26, top: MON.y - 26, width: MON.w + 52, height: MON.h + 52 }} />
          <div className="monitor-stand" style={{ left: MON.x + MON.w / 2 - 70, top: MON.y + MON.h + 24 }} />
          {/* desk */}
          <div className="desk">
            <div className="desk-lights">
              {Array.from({ length: 18 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${(i * 0.37) % 2.4}s` }} />
              ))}
            </div>
          </div>
          <div className="seated">
            <Prince pose="seated" />
          </div>
        </div>
      </div>

      {/* the map lives in its own full-size layer that is transformed onto the monitor */}
      <div ref={mapBox} className={`map-box ${full ? 'full' : 'mini'}`} style={{ width: vp.w, height: vp.h, opacity: portrait && !full ? 0 : 1, transition: 'opacity 0.6s' }}>
        <MapScene interactive={full} onBack={() => setScene('ship')} />
        {!full && <div className="monitor-scan" />}
      </div>

      {!full && (
        <div className="ship-title">
          <p className="eyebrow">Constellation atlas</p>
          <h1>Little Sky</h1>
          <p className="lede">Board the ship, choose a place on Earth, and look up — to the stars, constellations and planets that are really there, right now.</p>
          <button className="primary big" onClick={() => setScene('map')}>
            Begin the journey →
          </button>
        </div>
      )}

      {!full && (
        <p className="credits">
          Star data: Hipparcos catalogue via <a href="https://github.com/ofrohn/d3-celestial" target="_blank" rel="noreferrer">d3-celestial</a> (BSD-3) · Positions: <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">Astronomy Engine</a> (MIT) · Map: <a href="https://github.com/topojson/world-atlas" target="_blank" rel="noreferrer">Natural Earth via world-atlas</a> · Photos &amp; text: Wikipedia contributors (see each file’s licence)
        </p>
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { computeBodies } from '../astro/bodies'
import { eqjToHorizon, toAltAz, mulMat } from '../astro/coords'
import { rgb, skyLook, twilightName } from '../astro/skyColor'
import { simDate, useAppStore } from '../store/useAppStore'
import { WarpField } from './WarpField'

/** The ship descends through the clouds toward the chosen place; the sky colour at the end matches the real local sun. */
export function LandingScene() {
  const place = useAppStore((s) => s.place)!
  const setScene = useAppStore((s) => s.setScene)
  const setMode = useAppStore((s) => s.setMode)
  const offsetMs = useAppStore((s) => s.offsetMs)
  const root = useRef<HTMLDivElement>(null)
  const speed = useRef(2.6)
  const [phase, setPhase] = useState('Entering the atmosphere…')

  const look = useMemo(() => {
    const date = simDate(offsetMs)
    const sun = computeBodies(date, place)[0]
    const alt = toAltAz(mulMat(eqjToHorizon(date, place), sun.vec)).alt
    return { look: skyLook(alt), alt }
  }, [place, offsetMs])

  useEffect(() => {
    const done = () => {
      setMode('park')
      setScene('sky')
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: done })
      tl.set('.land-ship', { y: '-60vh', scale: 0.35, opacity: 0 })
      tl.to(speed, { current: 0.5, duration: 3.2, ease: 'power2.out' }, 0)
      tl.to('.land-ship', { opacity: 1, y: '-6vh', scale: 1, duration: 2.6, ease: 'power2.out' }, 0.4)
      tl.to('.land-sky', { opacity: 1, duration: 2.6, ease: 'power1.in' }, 0.9)
      tl.to('.land-warp', { opacity: 0, duration: 1.8 }, 2.2)
      tl.fromTo('.land-cloud', { y: '110vh', opacity: 0 }, { y: '-30vh', opacity: 0.85, duration: 2.4, stagger: 0.22, ease: 'power1.in' }, 1.2)
      tl.to('.land-cloud', { opacity: 0, duration: 0.8, stagger: 0.1 }, 3.4)
      tl.add(() => setPhase('Touching down…'), 3.0)
      tl.to('.land-ship', { y: '24vh', scale: 1.15, duration: 1.6, ease: 'power2.inOut' }, 3.1)
      tl.to('.land-ground', { y: 0, duration: 1.6, ease: 'power2.inOut' }, 3.1)
      tl.add(() => setPhase('Hatch opening…'), 4.5)
      tl.to('.land-hatch', { opacity: 1, scaleY: 1, duration: 0.7 }, 4.6)
      tl.to('.land-fade', { opacity: 1, duration: 0.8 }, 5.3)
    }, root)
    return () => ctx.revert()
  }, [setMode, setScene])

  return (
    <div ref={root} className="landing" style={{ ['--sky-top' as string]: rgb(look.look.top), ['--sky-bottom' as string]: rgb(look.look.bottom) }}>
      <div className="land-warp">
        <WarpField speedRef={speed} count={220} />
      </div>
      <div className="land-sky" />
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="land-cloud" style={{ left: `${(i * 17 + 5) % 90}%`, width: `${22 + ((i * 7) % 18)}vw` }} />
      ))}
      <div className="land-ground" />
      <svg className="land-ship" viewBox="0 0 240 200" aria-hidden="true">
        <defs>
          <linearGradient id="hull" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9edf7" />
            <stop offset="1" stopColor="#8a96b8" />
          </linearGradient>
        </defs>
        <path d="M120 10 C170 40 190 110 176 150 L64 150 C50 110 70 40 120 10 Z" fill="url(#hull)" />
        <circle cx="120" cy="82" r="20" fill="#122244" stroke="#cdd6ee" strokeWidth="5" />
        <circle cx="113" cy="76" r="6" fill="rgba(180,210,255,0.5)" />
        <path d="M64 120 L28 170 L70 154 Z" fill="#d95b5b" />
        <path d="M176 120 L212 170 L170 154 Z" fill="#d95b5b" />
        <rect x="96" y="148" width="48" height="10" rx="3" fill="#6f7b9c" />
        <path className="land-hatch" d="M104 150 L136 150 L132 176 L108 176 Z" fill="rgba(255,226,160,0.95)" style={{ opacity: 0, transformOrigin: '120px 150px', transform: 'scaleY(0.2)' }} />
        <g className="land-flame">
          <path d="M100 158 Q120 214 140 158 Z" fill="rgba(255,190,90,0.0)" />
        </g>
      </svg>
      <div className="land-text">
        <p className="eyebrow">{place.name}</p>
        <h2>{phase}</h2>
        <p>
          {place.lat >= 0 ? place.lat.toFixed(2) + '° N' : Math.abs(place.lat).toFixed(2) + '° S'} · {place.lon >= 0 ? place.lon.toFixed(2) + '° E' : Math.abs(place.lon).toFixed(2) + '° W'} · {twilightName(look.alt)} outside
        </p>
      </div>
      <button className="ghost skip" onClick={() => { setMode('park'); setScene('sky') }}>
        Skip
      </button>
      <div className="land-fade" />
    </div>
  )
}

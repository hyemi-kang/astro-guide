import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export type Pose = 'look' | 'walk' | 'notebook' | 'paper' | 'seated'

interface Props {
  pose: Pose
  /** show the character from the front (spaceship seat) instead of from behind */
  className?: string
}

const SKIN = '#f6d3b3'
const HAIR = '#f2c94c'
const HAIR_DARK = '#d9a62b'
const COAT = '#3f7d63'
const COAT_DARK = '#2f6350'
const SCARF = '#f4c542'
const PANTS = '#243257'

/**
 * A little-prince-style traveller seen from behind. Every limb is its own group so GSAP can pose it.
 * Poses: look (gazing up), walk (loop), notebook (book in left hand), paper (right arm raised to hold the paper disc), seated.
 */
export function Prince({ pose, className }: Props) {
  const root = useRef<SVGSVGElement>(null)
  const walkTl = useRef<gsap.core.Timeline | null>(null)

  // gentle always-on motion: scarf flutter and breathing
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.p-scarf-tail', { rotation: 9, svgOrigin: '98 92', duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to('.p-scarf-tail2', { rotation: -7, svgOrigin: '98 94', duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.2 })
      gsap.to('.p-torso', { y: 1.4, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to('.p-hair-tuft', { rotation: 3, svgOrigin: '80 40', duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    }, root)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      walkTl.current?.kill()
      const d = 0.7
      const to = (sel: string, vars: gsap.TweenVars) => gsap.to(sel, { duration: d, ease: 'power3.inOut', overwrite: 'auto', ...vars })
      const rest = { rotation: 0 }
      if (pose === 'walk') {
        const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut', duration: 0.38 } })
        tl.fromTo('.p-leg-l', { rotation: -20, svgOrigin: '74 150' }, { rotation: 20, svgOrigin: '74 150' }, 0)
          .fromTo('.p-leg-r', { rotation: 20, svgOrigin: '92 150' }, { rotation: -20, svgOrigin: '92 150' }, 0)
          .fromTo('.p-arm-l', { rotation: 16, svgOrigin: '56 98' }, { rotation: -16, svgOrigin: '56 98' }, 0)
          .fromTo('.p-arm-r', { rotation: -16, svgOrigin: '104 98' }, { rotation: 16, svgOrigin: '104 98' }, 0)
          .fromTo('.p-body', { y: 0 }, { y: -3, duration: 0.19, yoyo: true, repeat: 1 }, 0)
        walkTl.current = tl
        to('.p-head', { rotation: 0, svgOrigin: '80 84' })
        to('.p-book', { opacity: 0, duration: 0.3 })
        return
      }
      gsap.killTweensOf('.p-leg-l, .p-leg-r, .p-arm-l, .p-arm-r, .p-body')
      to('.p-leg-l', { ...rest, svgOrigin: '74 150' })
      to('.p-leg-r', { ...rest, svgOrigin: '92 150' })
      to('.p-body', { y: 0, duration: 0.3 })
      if (pose === 'look') {
        to('.p-head', { rotation: -24, svgOrigin: '80 84' })
        to('.p-arm-l', { rotation: 5, svgOrigin: '56 98' })
        to('.p-arm-r', { rotation: -5, svgOrigin: '104 98' })
        to('.p-book', { opacity: 0, duration: 0.3 })
      } else if (pose === 'notebook') {
        to('.p-head', { rotation: -6, svgOrigin: '80 84' })
        to('.p-arm-l', { rotation: -78, svgOrigin: '56 98' })
        to('.p-arm-r', { rotation: 12, svgOrigin: '104 98' })
        to('.p-book', { opacity: 1, duration: 0.5, delay: 0.35 })
      } else if (pose === 'paper') {
        to('.p-head', { rotation: -30, svgOrigin: '80 84' })
        to('.p-arm-l', { rotation: 6, svgOrigin: '56 98' })
        to('.p-arm-r', { rotation: -158, svgOrigin: '104 98', duration: 0.9 })
        to('.p-book', { opacity: 0, duration: 0.3 })
      } else {
        to('.p-head', { rotation: -8, svgOrigin: '80 84' })
        to('.p-arm-l', { rotation: -40, svgOrigin: '56 98' })
        to('.p-arm-r', { rotation: 40, svgOrigin: '104 98' })
      }
    }, root)
    return () => ctx.revert()
  }, [pose])

  return (
    <svg ref={root} className={className} viewBox="0 0 160 240" role="img" aria-label="The traveller">
      <ellipse cx="80" cy="226" rx="42" ry="7" fill="rgba(0,0,0,0.32)" />
      <g className="p-body">
        {/* legs */}
        <g className="p-leg-l">
          <rect x="64" y="150" width="17" height="62" rx="7" fill={PANTS} />
          <rect x="60" y="206" width="24" height="13" rx="6" fill="#1b2036" />
        </g>
        <g className="p-leg-r">
          <rect x="84" y="150" width="17" height="62" rx="7" fill={PANTS} />
          <rect x="80" y="206" width="24" height="13" rx="6" fill="#1b2036" />
        </g>
        <g className="p-torso">
          {/* coat */}
          <path d="M52 94 Q80 84 108 94 L114 172 Q80 182 46 172 Z" fill={COAT} />
          <path d="M80 90 L80 176" stroke={COAT_DARK} strokeWidth="1.6" />
          <path d="M47 160 Q80 170 113 160" stroke={COAT_DARK} strokeWidth="3" fill="none" />
          {/* left arm (viewer's left) */}
          <g className="p-arm-l">
            <rect x="46" y="94" width="17" height="54" rx="8" fill={COAT} />
            <circle cx="54.5" cy="152" r="8" fill={SKIN} />
            <g className="p-book" opacity="0">
              <g transform="translate(40 142) rotate(-14)">
                <rect x="-6" y="-2" width="42" height="30" rx="3" fill="#35508f" />
                <rect x="-2" y="1" width="34" height="24" rx="2" fill="#f7efd9" />
                <path d="M15 1 V25" stroke="#c9b98f" strokeWidth="1" />
                <path d="M2 8 H12 M2 13 H12 M2 18 H10 M19 8 H29 M19 13 H29" stroke="#b9a984" strokeWidth="1" />
                <circle cx="24" cy="19" r="2" fill="#f4c542" />
              </g>
            </g>
          </g>
          {/* right arm */}
          <g className="p-arm-r">
            <rect x="97" y="94" width="17" height="54" rx="8" fill={COAT} />
            <circle cx="105.5" cy="152" r="8" fill={SKIN} />
          </g>
          {/* scarf */}
          <path d="M58 88 Q80 100 102 88 L104 98 Q80 112 56 98 Z" fill={SCARF} />
          <g className="p-scarf-tail">
            <path d="M98 92 Q124 96 142 118 Q132 124 124 118 Q112 104 96 102 Z" fill={SCARF} />
            <path d="M126 112 L142 118" stroke="#d9a62b" strokeWidth="1.4" />
          </g>
          <g className="p-scarf-tail2">
            <path d="M92 98 Q114 110 120 134 Q110 136 106 128 Q98 114 88 106 Z" fill="#e5b232" />
          </g>
        </g>
        {/* head (back of the head: golden hair) */}
        <g className="p-head">
          <rect x="72" y="76" width="16" height="16" rx="6" fill={SKIN} />
          <circle cx="80" cy="56" r="27" fill={SKIN} />
          <ellipse cx="54" cy="58" rx="4.5" ry="7" fill={SKIN} />
          <ellipse cx="106" cy="58" rx="4.5" ry="7" fill={SKIN} />
          <path d="M53 52 Q50 24 80 24 Q110 24 107 52 Q106 70 98 76 Q80 82 62 76 Q54 70 53 52 Z" fill={HAIR} />
          <g className="p-hair-tuft">
            <path d="M62 30 L56 14 L70 24 L72 8 L82 24 L92 8 L94 24 L108 14 L100 34 Z" fill={HAIR} />
            <path d="M70 24 L72 8 M82 24 L92 8" stroke={HAIR_DARK} strokeWidth="1.2" fill="none" />
          </g>
          <path d="M62 62 Q80 74 98 62" stroke={HAIR_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M66 46 Q80 40 94 46 M64 54 Q80 50 96 54" stroke={HAIR_DARK} strokeWidth="1.2" fill="none" opacity="0.7" />
        </g>
      </g>
    </svg>
  )
}

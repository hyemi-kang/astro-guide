import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import * as Astronomy from 'astronomy-engine'
import { geoCircle, geoGraticule10, geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import tzlookup from 'tz-lookup'
import { CITIES, COUNTRY_FOCUS, type City } from '../data/cities'
import { simDate, useAppStore } from '../store/useAppStore'

interface CountryProps {
  name: string
}
type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, CountryProps> & { id?: string }

interface Picked {
  name: string
  lat: number
  lon: number
}

const SPHERE = { type: 'Sphere' } as const

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371
  const toR = Math.PI / 180
  const dLat = (b.lat - a.lat) * toR
  const dLon = (b.lon - a.lon) * toR
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

interface Props {
  /** when false the map is only a picture on the ship's monitor */
  interactive: boolean
  onBack: () => void
}

export function MapScene({ interactive, onBack }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const [size, setSize] = useState({ w: 1200, h: 700 })
  const [features, setFeatures] = useState<CountryFeature[]>([])
  const [hover, setHover] = useState<string | null>(null)
  const [country, setCountry] = useState<CountryFeature | null>(null)
  const [picked, setPicked] = useState<Picked | null>(null)
  const [query, setQuery] = useState('')
  const view = useRef({ k: 1, tx: 0, ty: 0 })
  const [k, setK] = useState(1)
  const offsetMs = useAppStore((s) => s.offsetMs)
  const setPlace = useAppStore((s) => s.setPlace)
  const setScene = useAppStore((s) => s.setScene)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/countries-50m.json`)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const fc = feature(topo, topo.objects.countries as GeometryCollection<CountryProps>) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryProps>
        setFeatures(fc.features as CountryFeature[])
      })
  }, [])

  useEffect(() => {
    const el = wrap.current!
    const apply = () => setSize({ w: el.clientWidth || 1200, h: el.clientHeight || 700 })
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const projection = useMemo(() => {
    const pad = 28
    return geoNaturalEarth1().fitExtent(
      [
        [pad, pad + 50],
        [size.w - pad, size.h - pad - 20],
      ],
      SPHERE as unknown as GeoPermissibleObjects,
    )
  }, [size])
  const path = useMemo(() => geoPath(projection), [projection])
  const paths = useMemo(() => features.map((f) => ({ f, d: path(f) ?? '' })), [features, path])
  const graticule = useMemo(() => path(geoGraticule10()) ?? '', [path])
  const sphere = useMemo(() => path(SPHERE as unknown as GeoPermissibleObjects) ?? '', [path])

  // day / night terminator for the simulated moment
  const night = useMemo(() => {
    const date = simDate(offsetMs)
    const eq = Astronomy.Equator(Astronomy.Body.Sun, date, new Astronomy.Observer(0, 0, 0), true, true)
    const gast = Astronomy.SiderealTime(date)
    const lon = (eq.ra - gast) * 15
    const circle = geoCircle().center([lon + 180, -eq.dec]).radius(90)()
    return path(circle as unknown as GeoPermissibleObjects) ?? ''
  }, [offsetMs, path])

  const apply = (to: { k: number; tx: number; ty: number }, animate = true) => {
    const g = gRef.current
    if (!g) return
    const cur = view.current
    if (!animate) {
      Object.assign(cur, to)
      g.setAttribute('transform', `translate(${cur.tx} ${cur.ty}) scale(${cur.k})`)
      setK(cur.k)
      return
    }
    gsap.killTweensOf(cur)
    gsap.to(cur, {
      ...to,
      duration: 1.15,
      ease: 'power3.inOut',
      onUpdate: () => {
        g.setAttribute('transform', `translate(${cur.tx} ${cur.ty}) scale(${cur.k})`)
        setK(cur.k)
      },
    })
  }

  const zoomTo = (f: CountryFeature | null) => {
    if (!f) {
      apply({ k: 1, tx: 0, ty: 0 })
      return
    }
    const focus = COUNTRY_FOCUS[f.properties.name]
    let k: number
    let cx: number
    let cy: number
    if (focus) {
      const p = projection(focus.center) ?? [size.w / 2, size.h / 2]
      ;[cx, cy] = p
      k = focus.k
    } else {
      const [[x0, y0], [x1, y1]] = path.bounds(f)
      const bw = Math.max(x1 - x0, 1)
      const bh = Math.max(y1 - y0, 1)
      k = Math.min(36, 0.62 / Math.max(bw / size.w, bh / (size.h - 80)))
      cx = (x0 + x1) / 2
      cy = (y0 + y1) / 2
    }
    // keep a margin for the side panel on the right
    const tx = size.w * 0.38 - k * cx
    const ty = size.h * 0.52 - k * cy
    apply({ k, tx, ty })
  }

  const selectCountry = (f: CountryFeature | null) => {
    setCountry(f)
    setPicked(null)
    zoomTo(f)
  }

  const cities: City[] = country ? (CITIES[country.properties.name] ?? []) : []

  const pickAt = (lat: number, lon: number) => {
    const near = cities
      .map((c) => ({ c, d: haversineKm({ lat, lon }, c) }))
      .sort((a, b) => a.d - b.d)[0]
    if (near && near.d < 60) setPicked({ name: near.c.name, lat: near.c.lat, lon: near.c.lon })
    else setPicked({ name: `${country?.properties.name ?? 'Custom place'} · ${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`, lat, lon })
  }

  const onMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return
    const rect = svgRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const v = view.current
    const ll = projection.invert?.([(x - v.tx) / v.k, (y - v.ty) / v.k])
    if (!ll || !Number.isFinite(ll[0])) return
    const target = e.target as SVGElement
    const id = target.getAttribute('data-name')
    if (id) {
      const f = features.find((ff) => ff.properties.name === id)!
      if (country && f.properties.name === country.properties.name) pickAt(ll[1], ll[0])
      else selectCountry(f)
    } else if (country) {
      selectCountry(null)
    }
  }

  const land = (p: Picked) => {
    let tz = 'UTC'
    try {
      tz = tzlookup(p.lat, p.lon)
    } catch {
      /* fall back to UTC */
    }
    setPlace({ name: p.name, lat: p.lat, lon: p.lon, tz, country: country?.properties.name })
    setScene('landing')
  }

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return features.filter((f) => f.properties.name.toLowerCase().includes(q)).slice(0, 6)
  }, [query, features])

  const marker = picked ? projection([picked.lon, picked.lat]) : null

  return (
    <div ref={wrap} className={`map-scene ${interactive ? 'is-interactive' : ''}`}>
      <svg ref={svgRef} className="map-svg" viewBox={`0 0 ${size.w} ${size.h}`} onClick={onMapClick}>
        <defs>
          <radialGradient id="ocean" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#0f2a4a" />
            <stop offset="100%" stopColor="#070f22" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={size.w} height={size.h} fill="url(#ocean)" />
        <g ref={gRef}>
          <path d={sphere} fill="#0b2140" stroke="rgba(130,190,255,0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={graticule} fill="none" stroke="rgba(130,190,255,0.12)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          {paths.map(({ f, d }) => {
            const name = f.properties.name
            const sel = country?.properties.name === name
            const hov = hover === name
            return (
              <path
                key={name + (f.id ?? '')}
                d={d}
                data-name={name}
                className={`country ${sel ? 'sel' : ''} ${hov ? 'hov' : ''} ${country && !sel ? 'dim' : ''}`}
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => interactive && setHover(name)}
                onMouseLeave={() => setHover(null)}
              />
            )
          })}
          <path d={night} fill="rgba(2,4,18,0.52)" stroke="rgba(255,200,120,0.25)" strokeWidth="1" vectorEffect="non-scaling-stroke" pointerEvents="none" />
          {country &&
            cities.map((c) => {
              const p = projection([c.lon, c.lat])
              if (!p) return null
              const active = picked?.name === c.name
              return (
                <g
                  key={c.name}
                  transform={`translate(${p[0]} ${p[1]}) scale(${1 / k})`}
                  className={`city ${active ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setPicked({ name: c.name, lat: c.lat, lon: c.lon })
                  }}
                >
                  <circle r="14" fill="transparent" />
                  <circle r="4.2" className="dot" />
                  <circle r="9" className="pulse" />
                  <text x="9" y="4" className="lbl">
                    {c.name}
                  </text>
                </g>
              )
            })}
          {marker && (
            <g transform={`translate(${marker[0]} ${marker[1]}) scale(${1 / k})`} pointerEvents="none">
              <circle r="16" className="pin-ring" />
              <path d="M0 -4 L0 -22 M-5 -17 L0 -22 L5 -17" stroke="#ffd98a" strokeWidth="2" fill="none" />
              <circle r="3" fill="#ffd98a" />
            </g>
          )}
        </g>
      </svg>

      {interactive && (
        <>
          <div className="map-title">
            <button className="ghost" onClick={onBack}>
              ← Back to the ship
            </button>
            <div>
              <h2>{country ? country.properties.name : 'Where on Earth are you?'}</h2>
              <p>
                {!country && 'Step 1 of 2 — choose a country. The shaded half of the map is in night right now.'}
                {country && !picked && 'Step 2 of 2 — pick a place from the list, or click anywhere inside the country.'}
                {country && picked && 'Ready to land.'}
              </p>
            </div>
          </div>

          <div className="map-panel">
            {!country && (
              <>
                <label className="field">
                  <span>Find a country</span>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a country name…" />
                </label>
                {matches.length > 0 && (
                  <ul className="list">
                    {matches.map((f) => (
                      <li key={f.properties.name}>
                        <button
                          onClick={() => {
                            setQuery('')
                            selectCountry(f)
                          }}
                        >
                          {f.properties.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="hint">…or click it on the map. Hover to preview.</p>
                {hover && <p className="hover-name">{hover}</p>}
              </>
            )}
            {country && (
              <>
                <button className="ghost small" onClick={() => selectCountry(null)}>
                  ← All countries
                </button>
                {cities.length > 0 && (
                  <>
                    <h4>Places in {country.properties.name}</h4>
                    <ul className="list">
                      {cities.map((c) => (
                        <li key={c.name}>
                          <button className={picked?.name === c.name ? 'on' : ''} onClick={() => setPicked({ name: c.name, lat: c.lat, lon: c.lon })}>
                            {c.name}
                            <small>
                              {Math.abs(c.lat).toFixed(1)}°{c.lat >= 0 ? 'N' : 'S'}
                            </small>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="hint">{cities.length ? 'Or click any other spot inside the country.' : 'Click anywhere inside the country to choose a spot.'}</p>
                {picked && (
                  <div className="picked">
                    <strong>{picked.name}</strong>
                    <span>
                      {Math.abs(picked.lat).toFixed(3)}°{picked.lat >= 0 ? ' N' : ' S'} · {Math.abs(picked.lon).toFixed(3)}°{picked.lon >= 0 ? ' E' : ' W'}
                    </span>
                    <span>{safeTz(picked)}</span>
                    <button className="primary" onClick={() => land(picked)}>
                      Land here ↓
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function safeTz(p: { lat: number; lon: number }): string {
  try {
    return tzlookup(p.lat, p.lon)
  } catch {
    return 'UTC'
  }
}

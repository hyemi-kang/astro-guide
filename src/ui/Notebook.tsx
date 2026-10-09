import { useMemo, useState } from 'react'
import { animated, to, useSpring, useTransition } from '@react-spring/web'
import { BODY_IDS, computeBodies } from '../astro/bodies'
import { type Vec3, altitudeOf, eqjToHorizon, mulMat, toAltAz, vecToRadec } from '../astro/coords'
import { twilightName } from '../astro/skyColor'
import { skyControls } from '../sky/skyBus'
import { BODY_INFO } from '../data/planets.en'
import { CONSTELLATION_INFO } from '../data/constellations.en'
import type { Catalog } from '../data/loadCatalog'
import { type Selection, simDate, useAppStore } from '../store/useAppStore'
import { VisibilityPanel } from './VisibilityPanel'

interface Entry {
  key: string
  kind: 'Constellation' | 'Star' | 'Planet' | 'Deep sky'
  label: string
  sub: string
  hay: string
  sel: Selection
  vec: Vec3
  extent: { decMin: number; decMax: number }
  bodyId?: (typeof BODY_IDS)[number]
}

export function Notebook({ catalog }: { catalog: Catalog }) {
  const open = useAppStore((s) => s.notebookOpen)
  const setOpen = useAppStore((s) => s.setNotebook)
  const transitions = useTransition(open, {
    from: { y: 120, rot: 8, opacity: 0 },
    enter: { y: 0, rot: 0, opacity: 1 },
    leave: { y: 140, rot: 10, opacity: 0 },
    config: { tension: 210, friction: 22 },
  })
  return transitions((style, isOpen) =>
    isOpen ? (
      <animated.aside
        className="notebook"
        style={{ opacity: style.opacity, transform: to([style.y, style.rot], (y, r) => `translateY(${y}px) rotate(${r}deg)`) }}
      >
        <div className="spiral">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <button className="nb-close" onClick={() => setOpen(false)} aria-label="Close the notebook">
          ×
        </button>
        <NotebookBody catalog={catalog} />
      </animated.aside>
    ) : null,
  )
}

function NotebookBody({ catalog }: { catalog: Catalog }) {
  const place = useAppStore((s) => s.place)!
  const mode = useAppStore((s) => s.mode)
  const offsetMs = useAppStore((s) => s.offsetMs)
  const select = useAppStore((s) => s.select)
  // the place is fixed when the notebook is opened — the notes describe where you were standing
  const [openedAt] = useState(() => ({ date: simDate(offsetMs), place }))
  const date = openedAt.date
  const [query, setQuery] = useState('')
  const [entry, setEntry] = useState<Entry | null>(null)
  const bodies = useMemo(() => computeBodies(date, openedAt.place), [date, openedAt])

  const index = useMemo<Entry[]>(() => {
    const out: Entry[] = []
    for (const c of catalog.constellations) {
      const info = CONSTELLATION_INFO[c.id]
      out.push({
        key: `c-${c.id}`,
        kind: 'Constellation',
        label: c.name,
        sub: `${info?.meaning ?? c.latin} · ${c.id}`,
        hay: `${c.name} ${c.latin} ${c.id} ${info?.meaning ?? ''} ${c.genitive}`.toLowerCase(),
        sel: { kind: 'constellation', id: c.id },
        vec: c.centerVec,
        extent: { decMin: c.decMin, decMax: c.decMax },
      })
    }
    for (const b of bodies) {
      const info = BODY_INFO[b.id]
      out.push({
        key: `b-${b.id}`,
        kind: 'Planet',
        label: info.title,
        sub: info.tagline,
        hay: `${b.id} ${info.title} ${info.tagline} planet`.toLowerCase(),
        sel: { kind: 'body', id: b.id },
        vec: b.vec,
        extent: { decMin: 0, decMax: 0 },
        bodyId: b.id,
      })
    }
    const st = catalog.stars
    for (let i = 0; i < st.n; i++) {
      const nm = st.names.get(st.hip[i])
      if (!nm?.name) continue
      const con = catalog.byId.get(nm.c)
      out.push({
        key: `s-${st.hip[i]}`,
        kind: 'Star',
        label: nm.name,
        sub: `${nm.bayer ? nm.bayer + ' ' : ''}${con?.genitive ?? ''} · mag ${st.mag[i].toFixed(1)}`,
        hay: `${nm.name} ${nm.bayer} ${con?.name ?? ''} ${nm.hd} star`.toLowerCase(),
        sel: { kind: 'star', hip: st.hip[i] },
        vec: [st.vec[i * 3], st.vec[i * 3 + 1], st.vec[i * 3 + 2]],
        extent: { decMin: st.dec[i], decMax: st.dec[i] },
      })
    }
    for (const o of catalog.dsos) {
      out.push({
        key: `d-${o.id}`,
        kind: 'Deep sky',
        label: o.name,
        sub: `${o.kind} · ${o.desig}`,
        hay: `${o.name} ${o.desig} ${o.id} ${o.kind}`.toLowerCase(),
        sel: { kind: 'dso', id: o.id },
        vec: o.vec,
        extent: { decMin: o.dec, decMax: o.dec },
      })
    }
    return out
  }, [catalog, bodies])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const score = (e: Entry) => (e.label.toLowerCase() === q ? 0 : e.label.toLowerCase().startsWith(q) ? 1 : e.hay.includes(q) ? 2 : 9)
    const order = { Constellation: 0, Planet: 1, Star: 2, 'Deep sky': 3 }
    return index
      .filter((e) => score(e) < 9)
      .sort((a, b) => score(a) - score(b) || order[a.kind] - order[b.kind] || a.label.localeCompare(b.label))
      .slice(0, 40)
  }, [query, index])

  // what is up right now
  const tonight = useMemo(() => {
    const M = eqjToHorizon(date, openedAt.place)
    const sun = bodies[0]
    const sunAlt = altitudeOf(M, sun.vec)
    const cons = index
      .filter((e) => e.kind === 'Constellation')
      .map((e) => ({ e, alt: altitudeOf(M, e.vec) }))
      .filter((x) => x.alt > 25)
      .sort((a, b) => b.alt - a.alt)
      .slice(0, 10)
    const planets = index
      .filter((e) => e.kind === 'Planet' && e.bodyId !== 'Sun')
      .map((e) => ({ e, alt: altitudeOf(M, e.vec) }))
      .filter((x) => x.alt > 3)
    return { sunAlt, cons, planets }
  }, [index, date, openedAt, bodies])

  const showInSky = (e: Entry) => {
    const M = eqjToHorizon(date, openedAt.place)
    if (mode === 'space') {
      const { ra, dec } = vecToRadec(e.vec)
      void skyControls.current?.panTo(ra, dec, 45, 1.6)
    } else {
      const { alt, az } = toAltAz(mulMat(M, e.vec))
      void skyControls.current?.panTo(az, Math.max(-6, Math.min(alt, 80)), 60, 1.6)
    }
  }

  const list = (items: Entry[], alts?: Map<string, number>) => (
    <ul className="nb-list">
      {items.map((e) => (
        <li key={e.key}>
          <button onClick={() => setEntry(e)}>
            <span className={`tag k-${e.kind.replace(' ', '')}`}>{e.kind}</span>
            <b>{e.label}</b>
            <small>{alts?.has(e.key) ? `${alts.get(e.key)!.toFixed(0)}° up · ` : ''}{e.sub}</small>
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="nb-body">
      <header>
        <h3>Field notebook</h3>
        <p>
          Notes for <b>{openedAt.place.name}</b> · {twilightName(tonight.sunAlt).toLowerCase()}
        </p>
      </header>

      {!entry && (
        <PageTurn key="list" angle={0}>
          <label className="nb-search">
            <span>Search</span>
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Orion, Vega, Mars, Andromeda…" />
          </label>
          {query.trim() ? (
            results.length ? (
              list(results)
            ) : (
              <p className="nb-empty">Nothing found for “{query}”. Try a constellation, a named star, a planet or a famous nebula.</p>
            )
          ) : (
            <>
              <h4>Looking up from here, right now</h4>
              {tonight.sunAlt > -6 && <p className="nb-note">It is {twilightName(tonight.sunAlt).toLowerCase()} here, so stars are hidden. Try “Block the Sun” — or search for a constellation to learn when to look.</p>}
              {tonight.planets.length > 0 && (
                <>
                  <h5>Planets above the horizon</h5>
                  {list(
                    tonight.planets.map((x) => x.e),
                    new Map(tonight.planets.map((x) => [x.e.key, x.alt])),
                  )}
                </>
              )}
              <h5>Constellations well placed</h5>
              {tonight.cons.length ? (
                list(
                  tonight.cons.map((x) => x.e),
                  new Map(tonight.cons.map((x) => [x.e.key, x.alt])),
                )
              ) : (
                <p className="nb-empty">None above 25° right now.</p>
              )}
            </>
          )}
        </PageTurn>
      )}

      {entry && (
        <PageTurn key={entry.key} className="nb-page" angle={80}>
          <button className="nb-back" onClick={() => setEntry(null)}>
            ← Back to the list
          </button>
          <span className={`tag k-${entry.kind.replace(' ', '')}`}>{entry.kind}</span>
          <h2>{entry.label}</h2>
          <p className="nb-sub">{entry.sub}</p>
          <VisibilityPanel vec={entry.vec} extent={entry.extent} place={openedAt.place} date={date} bodyId={entry.bodyId} seasonal={entry.kind === 'Constellation'} />
          <div className="nb-actions">
            <button className="primary small" onClick={() => showInSky(entry)}>
              ✦ Show in the sky
            </button>
            <button className="ghost small" onClick={() => select(entry.sel)}>
              Open the full card
            </button>
          </div>
        </PageTurn>
      )}
    </div>
  )
}

/** A page that swings in from the binding when it mounts. */
function PageTurn({ children, className, angle }: { children: React.ReactNode; className?: string; angle: number }) {
  const s = useSpring({ from: { r: angle, o: 0 }, to: { r: 0, o: 1 }, config: { tension: 260, friction: 24 } })
  return (
    <animated.div className={className} style={{ opacity: s.o, transform: s.r.to((r) => `perspective(900px) rotateY(${r}deg)`), transformOrigin: 'left center' }}>
      {children}
    </animated.div>
  )
}

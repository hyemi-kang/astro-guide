import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { animated, config, to, useSpring, useTransition } from '@react-spring/web'
import { computeBodies, moonPhaseDeg, moonPhaseName } from '../astro/bodies'
import { type Vec3, radecToVec } from '../astro/coords'
import { bvToTemperature, SPECTRAL_COLOR_NAME, spectralClassFromTemperature } from '../astro/starColor'
import { BODY_INFO } from '../data/planets.en'
import { CONSTELLATION_INFO } from '../data/constellations.en'
import { DSO_INFO, DSO_KIND_BLURB } from '../data/dsos.en'
import { findGlossary } from '../data/glossary'
import type { Catalog, ConstellationData } from '../data/loadCatalog'
import { STAR_INFO } from '../data/stars.en'
import { constellationWikiTitles, useWiki } from '../data/wiki'
import { type Selection, simDate, useAppStore } from '../store/useAppStore'
import { StarChart } from './StarChart'
import { VisibilityPanel } from './VisibilityPanel'

const AREA_RANK = Object.entries(CONSTELLATION_INFO)
  .map(([id, i]) => [id, i.area] as const)
  .sort((a, b) => b[1] - a[1])
  .map(([id]) => id)

interface Props {
  catalog: Catalog
}

export function InfoModal({ catalog }: Props) {
  const selection = useAppStore((s) => s.selection)
  const select = useAppStore((s) => s.select)

  const transitions = useTransition(selection, {
    keys: (s) => (s ? JSON.stringify(s) : 'none'),
    from: { opacity: 0, y: 60, scale: 0.9, rot: -7 },
    enter: { opacity: 1, y: 0, scale: 1, rot: 0 },
    leave: { opacity: 0, y: 30, scale: 0.94, rot: 4 },
    config: { tension: 230, friction: 24 },
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && select(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [select])

  return transitions((style, sel) =>
    sel ? (
      <animated.div className="modal-backdrop" style={{ opacity: style.opacity }} onClick={() => select(null)}>
        <animated.div
          className="modal-card"
          style={{
            opacity: style.opacity,
            transform: to([style.y, style.scale, style.rot], (y, s, r) => `translateY(${y}px) scale(${s}) rotate(${r}deg)`),
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button className="modal-close" onClick={() => select(null)} aria-label="Close">
            ×
          </button>
          <ModalBody catalog={catalog} sel={sel} />
        </animated.div>
      </animated.div>
    ) : null,
  )
}

// ---------------------------------------------------------------------------
function ModalBody({ catalog, sel }: { catalog: Catalog; sel: Selection }) {
  const place = useAppStore((s) => s.place)!
  const offsetMs = useAppStore((s) => s.offsetMs)
  const date = useMemo(() => simDate(offsetMs), [offsetMs, sel]) // eslint-disable-line react-hooks/exhaustive-deps

  if (sel.kind === 'constellation') {
    const c = catalog.byId.get(sel.id)
    if (!c) return null
    return <ConstellationCard catalog={catalog} c={c} place={place} date={date} />
  }
  if (sel.kind === 'star') return <StarCard catalog={catalog} hip={sel.hip} place={place} date={date} />
  if (sel.kind === 'body') return <BodyCard id={sel.id} place={place} date={date} />
  return <DsoCard catalog={catalog} id={sel.id} place={place} date={date} />
}

// ---------------------------------------------------------------------------
function Polaroid({
  caption,
  titles,
  must,
  chart,
  placeholder,
  wantPhoto,
}: {
  caption: string
  titles: string[] | null
  must?: RegExp
  chart?: ReactNode
  placeholder?: ReactNode
  /** look for a real photograph before settling for the article's lead image (constellations) */
  wantPhoto?: boolean
}) {
  const { loading, data } = useWiki(titles, must, wantPhoto)
  const [flipped, setFlipped] = useState(false)
  const [failed, setFailed] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const src = [data?.photo, data?.thumbnail].find((u): u is string => !!u && !failed.includes(u))
  const isPhoto = !!src && src === data?.photo
  const hasPhoto = !!src
  const spring = useSpring({ rot: flipped ? 180 : 0, config: config.gentle })
  const drop = useSpring({ from: { y: -40, r: -9 }, to: { y: 0, r: -2.2 }, config: { tension: 170, friction: 13 } })

  const front = hasPhoto ? (
    <>
      {!loaded && <div className="polaroid-wait">Developing photo…</div>}
      <img
        key={src}
        className={loaded ? 'loaded' : ''}
        src={src}
        alt={caption}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false)
          setFailed((f) => [...f, src!])
        }}
        referrerPolicy="no-referrer"
      />
    </>
  ) : loading ? (
    <div className="polaroid-wait">Developing photo…</div>
  ) : (
    (chart ?? placeholder)
  )

  const canFlip = !!chart && hasPhoto
  return (
    <animated.figure className="polaroid" style={{ transform: to([drop.y, drop.r], (y, r) => `translateY(${y}px) rotate(${r}deg)`) }}>
      <div className="polaroid-tape" />
      <div className="polaroid-stage">
        <animated.div className="polaroid-face front" style={{ transform: spring.rot.to((r) => `rotateY(${r}deg)`), opacity: spring.rot.to((r) => (r < 90 ? 1 : 0)) }}>
          {front}
        </animated.div>
        {canFlip && (
          <animated.div className="polaroid-face back" style={{ transform: spring.rot.to((r) => `rotateY(${r - 180}deg)`), opacity: spring.rot.to((r) => (r > 90 ? 1 : 0)) }}>
            {chart}
          </animated.div>
        )}
      </div>
      <figcaption>
        <span className="hand">{caption}</span>
        {canFlip && (
          <button className="flip" onClick={() => setFlipped((f) => !f)}>
            {flipped ? 'Show photo' : 'Show star chart'}
          </button>
        )}
        {data && hasPhoto && (
          <a href={data.url} target="_blank" rel="noreferrer" className="credit">
            {isPhoto || !chart ? 'Photo' : 'IAU chart'} via Wikipedia ↗
          </a>
        )}
        {!hasPhoto && !loading && <span className="credit">Chart drawn from the Hipparcos catalogue</span>}
      </figcaption>
    </animated.figure>
  )
}

function Stat({ label, value, glossary }: { label: string; value: ReactNode; glossary?: string }) {
  return (
    <div className="stat" title={glossary}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Glossary({ text }: { text: string }) {
  const items = findGlossary(text)
  if (!items.length) return null
  return (
    <div className="glossary">
      <h4>Terms</h4>
      <ul>
        {items.map((g) => (
          <li key={g.term}>
            <strong>{g.term}.</strong> {g.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Extract({ titles, must }: { titles: string[] | null; must?: RegExp }) {
  const { data } = useWiki(titles, must)
  if (!data?.extract) return null
  return (
    <div className="extract">
      <h4>From Wikipedia</h4>
      <p>{data.extract}</p>
      <a href={data.url} target="_blank" rel="noreferrer">
        Read more ↗
      </a>
    </div>
  )
}

// ---------------------------------------------------------------------------
function ConstellationCard({ catalog, c, place, date }: { catalog: Catalog; c: ConstellationData; place: NonNullable<ReturnType<typeof useAppStore.getState>['place']>; date: Date }) {
  const info = CONSTELLATION_INFO[c.id]
  const select = useAppStore((s) => s.select)
  const titles = useMemo(() => constellationWikiTitles(c.name, c.latin, info?.wiki), [c, info])
  const members = useMemo(() => {
    const st = catalog.stars
    const out: { hip: number; name: string; mag: number }[] = []
    for (let i = 0; i < st.n; i++) {
      const nm = st.names.get(st.hip[i])
      if (nm && nm.c === c.id && nm.name) out.push({ hip: st.hip[i], name: nm.name, mag: st.mag[i] })
    }
    return out.sort((a, b) => a.mag - b.mag).slice(0, 10)
  }, [catalog, c])
  const rank = info ? AREA_RANK.indexOf(c.id) + 1 : 0
  const extent = useMemo(() => ({ decMin: c.decMin, decMax: c.decMax }), [c])
  const vec = c.centerVec

  return (
    <div className="modal-grid">
      <div className="modal-left">
        <Polaroid caption={`${c.name} — ${c.latin}`} titles={titles} must={/constellation/i} wantPhoto chart={<StarChart catalog={catalog} constellation={c} />} />
      </div>
      <div className="modal-right">
        <span className="kicker">Constellation{info?.zodiac ? ' · Zodiac' : ''}</span>
        <h2>{c.name}</h2>
        <p className="sub">
          {info?.meaning ?? c.latin} · IAU abbreviation <b>{c.id}</b> · genitive <i>{c.genitive}</i>
        </p>
        <dl className="stats">
          {info && <Stat label="Area" value={`${info.area} sq° (#${rank} of 88)`} />}
          {c.brightest && (
            <Stat
              label="Brightest star"
              value={
                <button className="link" onClick={() => select({ kind: 'star', hip: c.brightest!.hip })}>
                  {c.brightest.name} · mag {c.brightest.mag.toFixed(2)}
                </button>
              }
            />
          )}
          {info && <Stat label="Introduced" value={info.origin} />}
          <Stat label="Centre" value={`RA ${(c.center[0] / 15).toFixed(1)} h · Dec ${c.center[1] >= 0 ? '+' : ''}${c.center[1].toFixed(0)}°`} />
        </dl>

        <VisibilityPanel vec={vec} extent={extent} place={place} date={date} />

        {info?.story && (
          <section>
            <h4>The story</h4>
            <p>{info.story}</p>
          </section>
        )}
        {info?.fact && (
          <section>
            <h4>Did you know?</h4>
            <p>{info.fact}</p>
          </section>
        )}
        {info?.find && (
          <section>
            <h4>How to find it</h4>
            <p>{info.find}</p>
          </section>
        )}
        {members.length > 0 && (
          <section>
            <h4>Named stars</h4>
            <div className="chips">
              {members.map((m) => (
                <button key={m.hip} className="chip" onClick={() => select({ kind: 'star', hip: m.hip })}>
                  {m.name} <small>{m.mag.toFixed(1)}</small>
                </button>
              ))}
            </div>
          </section>
        )}
        <Glossary text={`${info?.fact ?? ''} ${info?.story ?? ''}`} />
        {!info?.story && <Extract titles={titles} must={/constellation/i} />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
function StarCard({ catalog, hip, place, date }: { catalog: Catalog; hip: number; place: NonNullable<ReturnType<typeof useAppStore.getState>['place']>; date: Date }) {
  const st = catalog.stars
  const select = useAppStore((s) => s.select)
  const i = st.hip.indexOf(hip)
  const nm = st.names.get(hip)
  const con = nm ? catalog.byId.get(nm.c) : undefined
  const info = nm?.name ? STAR_INFO[nm.name] : undefined
  const mag = st.mag[i]
  const bv = st.bv[i]
  const temp = bvToTemperature(bv)
  const cls = spectralClassFromTemperature(temp)
  const vec = useMemo<Vec3>(() => [st.vec[i * 3], st.vec[i * 3 + 1], st.vec[i * 3 + 2]], [st, i])
  const extent = useMemo(() => ({ decMin: st.dec[i], decMax: st.dec[i] }), [st, i])
  const title = nm?.name || `${nm?.bayer ?? ''} ${con?.genitive ?? ''}`.trim() || `HIP ${hip}`
  const wikiTitles = useMemo(() => (nm?.name ? [info?.wiki ?? nm.name, `${nm.name} (star)`] : null), [nm, info])
  const designations = [nm?.bayer && con ? `${nm.bayer} ${con.genitive}` : '', nm?.flam && con ? `${nm.flam} ${con.genitive}` : '', nm?.hd, `HIP ${hip}`, nm?.gliese].filter(Boolean)
  const text = `${info?.kind ?? ''} ${info?.fact ?? ''} ${info?.spectral ?? ''}`

  return (
    <div className="modal-grid">
      <div className="modal-left">
        <Polaroid caption={title} titles={wikiTitles} must={/star|binary|variable|giant|dwarf|system/i} chart={<StarChart catalog={catalog} starHip={hip} />} />
      </div>
      <div className="modal-right">
        <span className="kicker">Star</span>
        <h2>{title}</h2>
        <p className="sub">{designations.join(' · ')}</p>
        <dl className="stats">
          <Stat label="Apparent magnitude" value={`${mag.toFixed(2)}`} glossary="Lower numbers are brighter." />
          <Stat
            label="Colour & spectral class"
            value={
              <>
                <span className="swatch" style={{ background: kelvinCss(temp) }} /> {SPECTRAL_COLOR_NAME[cls]} · class {cls}
                {info ? ` (${info.spectral})` : ' (estimated from B–V)'}
              </>
            }
          />
          <Stat label="Surface temperature" value={`≈ ${Math.round(temp / 100) * 100} K (from B–V ${bv.toFixed(2)})`} />
          {info && <Stat label="Distance" value={`${info.distance.toLocaleString()} light-years`} />}
          {info && <Stat label="Type" value={info.kind} />}
          {info && <Stat label="Age" value={info.age} />}
          {info && <Stat label="Luminosity" value={`${info.luminosity} the Sun`} />}
          {con && (
            <Stat
              label="Constellation"
              value={
                <button className="link" onClick={() => select({ kind: 'constellation', id: con.id })}>
                  {con.name}
                </button>
              }
            />
          )}
          <Stat label="Coordinates (J2000)" value={`RA ${(st.ra[i] / 15).toFixed(2)} h · Dec ${st.dec[i] >= 0 ? '+' : ''}${st.dec[i].toFixed(2)}°`} />
        </dl>

        <section>
          <h4>Which galaxy?</h4>
          <p>
            Like every star you can see without a telescope, {title} belongs to our own galaxy, the <b>Milky Way</b> — a disc of 100–400 billion stars about 100,000 light-years wide. It lies in the Sun’s neighbourhood of
            the Orion Arm (the Local Spur), within a few thousand light-years of us. Stars inside the Milky Way show no cosmological redshift; only small Doppler shifts from their own motion.
          </p>
        </section>

        {info && (
          <section>
            <h4>Did you know?</h4>
            <p>{info.fact}</p>
          </section>
        )}
        <VisibilityPanel vec={vec} extent={extent} place={place} date={date} seasonal={false} />
        {info && <Glossary text={text} />}
        {!info && (
          <p className="note">This is a fainter catalogue star, so detailed distance and age values are not listed. Colour and temperature are derived from its measured B–V colour index.</p>
        )}
        <Extract titles={wikiTitles} must={/star|binary|variable|giant|dwarf|system/i} />
      </div>
    </div>
  )
}

function kelvinCss(k: number): string {
  // match the sky renderer's tint
  const t = Math.max(1000, Math.min(40000, k)) / 100
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592)
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307
  const c = (x: number) => Math.max(0, Math.min(255, x)) | 0
  return `rgb(${c(r)},${c(g)},${c(b)})`
}

// ---------------------------------------------------------------------------
function BodyCard({ id, place, date }: { id: keyof typeof BODY_INFO; place: NonNullable<ReturnType<typeof useAppStore.getState>['place']>; date: Date }) {
  const info = BODY_INFO[id]
  const live = useMemo(() => computeBodies(date, place).find((b) => b.id === id)!, [id, place, date])
  const phaseDeg = id === 'Moon' ? moonPhaseDeg(date) : 0
  const lightMin = (live.distAu * 499.0048) / 60
  const isPlanet = id !== 'Sun' && id !== 'Moon'
  const extent = useMemo(() => ({ decMin: 0, decMax: 0 }), [])
  const text = `${info.fun.join(' ')} ${info.type}`

  return (
    <div className="modal-grid">
      <div className="modal-left">
        <Polaroid
          caption={info.title}
          titles={[info.wiki]}
          placeholder={<div className="body-disc" style={{ background: bodyGradient(id) }} />}
        />
      </div>
      <div className="modal-right">
        <span className="kicker">{isPlanet ? 'Planet' : id === 'Sun' ? 'Star' : 'Satellite'}</span>
        <h2>{info.title}</h2>
        <p className="sub">
          {info.tagline} · {info.type}
        </p>
        <h4>Right now</h4>
        <dl className="stats">
          <Stat label="Distance from you" value={`${live.distAu < 0.1 ? (live.distAu * 149597870.7).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' km' : live.distAu.toFixed(3) + ' AU'} · light-time ${lightMin < 1 ? (lightMin * 60).toFixed(1) + ' s' : lightMin.toFixed(1) + ' min'}`} />
          <Stat label="Apparent magnitude" value={live.mag.toFixed(1)} />
          <Stat label="Apparent size" value={live.diameterArcsec > 120 ? `${(live.diameterArcsec / 60).toFixed(1)}′` : `${live.diameterArcsec.toFixed(1)}″`} />
          {isPlanet && <Stat label="Angle from the Sun" value={`${live.elongation.toFixed(0)}°`} />}
          {id !== 'Sun' && <Stat label="Illuminated" value={`${(live.phaseFraction * 100).toFixed(0)} %${id === 'Moon' ? ` · ${moonPhaseName(phaseDeg)}` : ''}`} />}
        </dl>

        <VisibilityPanel vec={live.vec} extent={extent} place={place} date={date} bodyId={id} seasonal={false} />

        <h4>Facts</h4>
        <dl className="stats">
          {info.facts.map(([k, v]) => (
            <Stat key={k} label={k} value={v} />
          ))}
        </dl>
        <section>
          <h4>Did you know?</h4>
          <ul className="fun">
            {info.fun.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
        <Glossary text={text} />
        <Extract titles={[info.wiki]} />
      </div>
    </div>
  )
}

function bodyGradient(id: string): string {
  const m: Record<string, string> = {
    Sun: 'radial-gradient(circle at 40% 35%, #fff7c2, #ffb52e 55%, #e8751a)',
    Moon: 'radial-gradient(circle at 38% 35%, #f6f4ea, #b8b6ac 60%, #7d7c78)',
    Mercury: 'radial-gradient(circle at 38% 35%, #d8d0c6, #8c8379 65%, #4f4a44)',
    Venus: 'radial-gradient(circle at 38% 35%, #fff2cf, #e6c27a 60%, #a97c3b)',
    Mars: 'radial-gradient(circle at 38% 35%, #f6b08a, #c1583a 60%, #6e2b1b)',
    Jupiter: 'repeating-linear-gradient(8deg, #e9d3b4 0 12px, #c99d70 12px 22px, #f1e3cd 22px 30px)',
    Saturn: 'radial-gradient(circle at 38% 35%, #f5e6b8, #cfb26a 60%, #7d6a36)',
    Uranus: 'radial-gradient(circle at 38% 35%, #d5f6f6, #7ed3d9 60%, #3b8d98)',
    Neptune: 'radial-gradient(circle at 38% 35%, #9bb4ff, #3d5fd8 60%, #1a2c80)',
  }
  return m[id] ?? m.Moon
}

// ---------------------------------------------------------------------------
function DsoCard({ catalog, id, place, date }: { catalog: Catalog; id: string; place: NonNullable<ReturnType<typeof useAppStore.getState>['place']>; date: Date }) {
  const o = catalog.dsos.find((d) => d.id === id)
  const info = o ? DSO_INFO[o.id] : undefined
  const extent = useMemo(() => (o ? { decMin: o.dec, decMax: o.dec } : { decMin: 0, decMax: 0 }), [o])
  if (!o) return null
  const wiki = [info?.wiki ?? o.name]
  const vec = radecToVec(o.ra, o.dec)
  return (
    <div className="modal-grid">
      <div className="modal-left">
        <Polaroid caption={o.name} titles={wiki} placeholder={<div className="body-disc" style={{ background: 'radial-gradient(circle, #6a7fd8, #1a2250 70%)' }} />} />
      </div>
      <div className="modal-right">
        <span className="kicker">Deep-sky object · {o.kind}</span>
        <h2>{o.name}</h2>
        <p className="sub">
          {o.desig !== o.id ? `${o.desig} · ${o.id}` : o.id}
        </p>
        <dl className="stats">
          <Stat label="Type" value={o.kind} />
          {Number.isFinite(o.mag) && <Stat label="Apparent magnitude" value={o.mag.toFixed(1)} />}
          {info && <Stat label="Distance" value={info.distance} />}
          {info && <Stat label="Size" value={info.size} />}
          {info?.age && <Stat label="Age" value={info.age} />}
          <Stat label="Coordinates (J2000)" value={`RA ${(o.ra / 15).toFixed(2)} h · Dec ${o.dec >= 0 ? '+' : ''}${o.dec.toFixed(1)}°`} />
        </dl>
        <section>
          <h4>What is it?</h4>
          <p>{DSO_KIND_BLURB[o.kind]}</p>
          {info && <p>{info.note}</p>}
        </section>
        <VisibilityPanel vec={vec} extent={extent} place={place} date={date} seasonal={false} />
        <Glossary text={`${info?.note ?? ''} ${DSO_KIND_BLURB[o.kind]}`} />
        <Extract titles={wiki} />
      </div>
    </div>
  )
}

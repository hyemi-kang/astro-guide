import { type Vec3, radecToVec } from '../astro/coords'

export interface StarName {
  name: string
  bayer: string
  flam: string
  hd: string
  hip: string
  /** constellation abbreviation */
  c: string
  gliese: string
}

export interface StarCatalog {
  n: number
  hip: Int32Array
  ra: Float32Array
  dec: Float32Array
  mag: Float32Array
  bv: Float32Array
  /** unit vectors, J2000 equatorial frame, 3 floats per star */
  vec: Float32Array
  names: Map<number, StarName>
}

export interface ConstellationData {
  id: string
  name: string
  latin: string
  genitive: string
  /** label anchor (deg) */
  center: [number, number]
  centerVec: Vec3
  /** stick-figure polylines as unit vectors (EQJ) */
  lines: Vec3[][]
  decMin: number
  decMax: number
  /** HIP ids of the stars that make up the figure's brightest members */
  brightest?: { hip: number; name: string; mag: number }
}

export interface BorderLine {
  ids: string[]
  points: Vec3[]
}

export type DsoKind = 'Galaxy' | 'Nebula' | 'Open cluster' | 'Globular cluster' | 'Star-forming region' | 'Supernova remnant' | 'Planetary nebula' | 'Dark nebula' | 'Object'

export interface DeepSky {
  id: string
  desig: string
  name: string
  kind: DsoKind
  mag: number
  vec: Vec3
  ra: number
  dec: number
  /** apparent size in arcminutes (major axis) */
  size: number
}

export interface Catalog {
  stars: StarCatalog
  constellations: ConstellationData[]
  byId: Map<string, ConstellationData>
  borders: BorderLine[]
  dsos: DeepSky[]
  mwFeatures: { coordinates: number[][][][] }[]
}

const DSO_KIND: Record<string, DsoKind> = {
  s: 'Galaxy',
  i: 'Galaxy',
  e: 'Galaxy',
  bn: 'Nebula',
  en: 'Nebula',
  rn: 'Nebula',
  dn: 'Dark nebula',
  oc: 'Open cluster',
  gc: 'Globular cluster',
  sfr: 'Star-forming region',
  snr: 'Supernova remnant',
  pn: 'Planetary nebula',
}

async function getJSON<T>(file: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${file}`)
  if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`)
  return (await res.json()) as T
}

interface GeoFeature<G = unknown, P = Record<string, unknown>> {
  id?: string | number
  ids?: string
  properties: P
  geometry: G
}
interface FC<G, P = Record<string, unknown>> {
  features: GeoFeature<G, P>[]
}

let cached: Promise<Catalog> | null = null

export function loadCatalog(): Promise<Catalog> {
  if (!cached) cached = build()
  return cached
}

async function build(): Promise<Catalog> {
  const [starsJ, namesJ, consJ, linesJ, bordersJ, dsosJ, dsoNamesJ, mwJ] = await Promise.all([
    getJSON<FC<{ coordinates: [number, number] }, { mag: number; bv: string }>>('stars.6.json'),
    getJSON<Record<string, StarName>>('starnames.json'),
    getJSON<FC<{ coordinates: [number, number] }, { name: string; gen: string; la: string }>>('constellations.json'),
    getJSON<FC<{ coordinates: number[][][] }>>('constellations.lines.json'),
    getJSON<FC<{ coordinates: number[][][] }>>('constellations.borders.json'),
    getJSON<FC<{ coordinates: [number, number] }, { desig: string; type: string; mag: string | number; dim: string }>>('dsos.6.json'),
    getJSON<Record<string, { name: string }>>('dsonames.json'),
    getJSON<FC<{ coordinates: number[][][][] }>>('mw.json'),
  ])

  // ---- stars -------------------------------------------------------------
  const feats = starsJ.features
  const n = feats.length
  const stars: StarCatalog = {
    n,
    hip: new Int32Array(n),
    ra: new Float32Array(n),
    dec: new Float32Array(n),
    mag: new Float32Array(n),
    bv: new Float32Array(n),
    vec: new Float32Array(n * 3),
    names: new Map(),
  }
  for (let i = 0; i < n; i++) {
    const f = feats[i]
    const [ra, dec] = f.geometry.coordinates
    const v = radecToVec(ra, dec)
    stars.hip[i] = Number(f.id)
    stars.ra[i] = ra < 0 ? ra + 360 : ra
    stars.dec[i] = dec
    stars.mag[i] = f.properties.mag
    const bv = parseFloat(f.properties.bv)
    stars.bv[i] = Number.isFinite(bv) ? bv : 0.6
    stars.vec[i * 3] = v[0]
    stars.vec[i * 3 + 1] = v[1]
    stars.vec[i * 3 + 2] = v[2]
    const nm = namesJ[String(f.id)]
    if (nm) stars.names.set(Number(f.id), nm)
  }

  // ---- constellations (Serpens appears twice: Caput + Cauda → merge) -----
  const byId = new Map<string, ConstellationData>()
  for (const f of consJ.features) {
    const id = String(f.id)
    const [ra, dec] = f.geometry.coordinates
    const existing = byId.get(id)
    if (existing) {
      existing.name = f.properties.la
      continue
    }
    byId.set(id, {
      id,
      name: f.properties.name,
      latin: f.properties.la,
      genitive: f.properties.gen,
      center: [ra < 0 ? ra + 360 : ra, dec],
      centerVec: radecToVec(ra, dec),
      lines: [],
      decMin: 90,
      decMax: -90,
    })
  }
  for (const f of linesJ.features) {
    const c = byId.get(String(f.id))
    if (!c) continue
    for (const poly of f.geometry.coordinates) {
      const pts = poly.map(([ra, dec]) => {
        c.decMin = Math.min(c.decMin, dec)
        c.decMax = Math.max(c.decMax, dec)
        return radecToVec(ra, dec)
      })
      c.lines.push(pts)
    }
  }
  // brightest star of each constellation, straight from the Hipparcos-derived catalogue
  for (let i = 0; i < n; i++) {
    const nm = stars.names.get(stars.hip[i])
    if (!nm) continue
    const c = byId.get(nm.c)
    if (c && (!c.brightest || stars.mag[i] < c.brightest.mag)) {
      c.brightest = { hip: stars.hip[i], name: nm.name || `${nm.bayer} ${c.genitive}`.trim(), mag: stars.mag[i] }
    }
  }

  // ---- borders -----------------------------------------------------------
  const borders: BorderLine[] = []
  for (const f of bordersJ.features) {
    const ids = String(f.ids ?? '').split(',')
    for (const poly of f.geometry.coordinates) {
      borders.push({ ids, points: poly.map(([ra, dec]) => radecToVec(ra, dec)) })
    }
  }

  // ---- named deep-sky objects -------------------------------------------
  const dsos: DeepSky[] = []
  for (const f of dsosJ.features) {
    const nm = dsoNamesJ[String(f.id)]
    if (!nm) continue
    const [ra, dec] = f.geometry.coordinates
    const mag = Number(f.properties.mag)
    const dim = parseFloat(String(f.properties.dim))
    dsos.push({
      id: String(f.id),
      desig: f.properties.desig,
      name: nm.name,
      kind: DSO_KIND[f.properties.type] ?? 'Object',
      mag: mag >= 99 ? NaN : mag,
      vec: radecToVec(ra, dec),
      ra: ra < 0 ? ra + 360 : ra,
      dec,
      size: Number.isFinite(dim) ? dim : 0,
    })
  }

  return {
    stars,
    constellations: [...byId.values()],
    byId,
    borders,
    dsos,
    mwFeatures: mwJ.features.map((f) => ({ coordinates: f.geometry.coordinates })),
  }
}

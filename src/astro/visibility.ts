import * as Astronomy from 'astronomy-engine'
import { type Mat3, type Place, type Vec3, altitudeOf, eqjToHorizon, radecToVec, toAltAz, mulMat, vecToRadec } from './coords'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Sample {
  date: Date
  m: Mat3
  sunAlt: number
}

const sunVecCache = new Map<number, Vec3>()
function sunVec(date: Date): Vec3 {
  const key = Math.round(date.getTime() / 60000)
  let v = sunVecCache.get(key)
  if (!v) {
    const eq = Astronomy.Equator(Astronomy.Body.Sun, date, new Astronomy.Observer(0, 0, 0), false, true)
    v = radecToVec(eq.ra * 15, eq.dec)
    if (sunVecCache.size > 5000) sunVecCache.clear()
    sunVecCache.set(key, v)
  }
  return v
}

function makeSample(date: Date, place: Place): Sample {
  const m = eqjToHorizon(date, place)
  return { date, m, sunAlt: altitudeOf(m, sunVec(date)) }
}

const sampleCache = new Map<string, Sample[]>()
function cached(key: string, build: () => Sample[]): Sample[] {
  let s = sampleCache.get(key)
  if (!s) {
    s = build()
    if (sampleCache.size > 20) sampleCache.clear()
    sampleCache.set(key, s)
  }
  return s
}

/** 10-minute samples for the 24 hours after `start` */
function next24h(start: Date, place: Place): Sample[] {
  const t0 = Math.floor(start.getTime() / 600000) * 600000
  return cached(`d|${place.lat.toFixed(2)}|${place.lon.toFixed(2)}|${t0}`, () =>
    Array.from({ length: 145 }, (_, i) => makeSample(new Date(t0 + i * 600000), place)),
  )
}

/** Hourly samples across one whole day in each month (mid-month), for seasonal visibility. */
function yearSamples(year: number, place: Place): Sample[][] {
  const key = `y|${place.lat.toFixed(1)}|${place.lon.toFixed(1)}|${year}`
  if (!sampleCache.has(key)) {
    const all: Sample[] = []
    for (let mo = 0; mo < 12; mo++) {
      // local-solar day: start at 12:00 local mean solar time so the night is contiguous
      const noonUtc = Date.UTC(year, mo, 15, 12) - (place.lon / 15) * 3600000
      for (let h = 0; h < 24; h++) all.push(makeSample(new Date(noonUtc + h * 3600000), place))
    }
    sampleCache.set(key, all)
  }
  const all = sampleCache.get(key)!
  return Array.from({ length: 12 }, (_, i) => all.slice(i * 24, i * 24 + 24))
}

let sunRaYear = 0
let sunRaTable: number[] = []
function sunRA(year: number, dayIndex: number): number {
  if (sunRaYear !== year) {
    sunRaYear = year
    sunRaTable = []
    for (let d = 0; d < 366; d++) {
      const t = new Date(Date.UTC(year, 0, 1 + d, 12))
      sunRaTable.push(vecToRadec(sunVec(t)).ra)
    }
  }
  return sunRaTable[dayIndex]
}

export interface Visibility {
  alt: number
  az: number
  /** above the horizon right now */
  up: boolean
  /** sun altitude right now */
  sunAlt: number
  /** next rising / setting (may be undefined for circumpolar / never-rising objects) */
  rise?: Date
  set?: Date
  circumpolar: boolean
  neverRises: boolean
  /** highest point reached during the next 24 h and when */
  culminationAlt: number
  culminationTime: Date
  /** highest altitude reached while the sky is astronomically dark (sun < −12°), next 24 h */
  darkMaxAlt: number | null
  /** date each year when it crosses the meridian at ~9 pm local mean solar time */
  bestDate: string
  /** months in which it climbs above 20° during dark hours */
  months: string[]
  /** latitude range in which the whole figure clears the horizon */
  fullLat: [number, number]
}

/**
 * Where is a sky position, and when can it be seen from `place`?
 * `eqj` is the object's unit vector (J2000). `decMin/decMax` give the extent of the figure.
 */
export function computeVisibility(
  eqj: Vec3,
  place: Place,
  now: Date,
  extent: { decMin: number; decMax: number },
): Visibility {
  const h = mulMat(eqjToHorizon(now, place), eqj)
  const { alt, az } = toAltAz(h)
  const samples = next24h(now, place)
  const sunAltNow = samples.length ? altitudeOf(eqjToHorizon(now, place), sunVec(now)) : 0

  let rise: Date | undefined
  let set: Date | undefined
  let best = -91
  let bestT = samples[0].date
  let darkMax: number | null = null
  let prev = altitudeOf(samples[0].m, eqj)
  let always = prev > 0
  let never = prev <= 0
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]
    const a = i === 0 ? prev : altitudeOf(s.m, eqj)
    if (i > 0) {
      if (prev <= 0 && a > 0) rise ??= s.date
      if (prev > 0 && a <= 0) set ??= s.date
      always = always && a > 0
      never = never && a <= 0
    }
    if (a > best) {
      best = a
      bestT = s.date
    }
    if (s.sunAlt < -12 && (darkMax === null || a > darkMax)) darkMax = a
    prev = a
  }

  // best date: object culminates at 21:00 local mean solar time ⇒ sun RA = object RA − 9 h
  const raObj = vecToRadec(eqj).ra
  const year = now.getUTCFullYear()
  const target = (raObj - 135 + 720) % 360
  let bestDay = 0
  let bestDiff = 999
  for (let d = 0; d < 365; d++) {
    const diff = Math.abs((((sunRA(year, d) - target + 540) % 360) + 360) % 360 - 180)
    if (diff < bestDiff) {
      bestDiff = diff
      bestDay = d
    }
  }
  const bd = new Date(Date.UTC(year, 0, 1 + bestDay))
  const bestDate = `${MONTHS[bd.getUTCMonth()]} ${bd.getUTCDate()}`

  const months: string[] = []
  const ys = yearSamples(year, place)
  for (let mo = 0; mo < 12; mo++) {
    let mx = -91
    for (const s of ys[mo]) {
      if (s.sunAlt < -12) mx = Math.max(mx, altitudeOf(s.m, eqj))
    }
    if (mx >= 20) months.push(MONTHS[mo])
  }

  const fullLat: [number, number] = [Math.max(-90, extent.decMax - 90), Math.min(90, 90 + extent.decMin)]

  return {
    alt,
    az,
    up: alt > 0,
    sunAlt: sunAltNow,
    rise,
    set,
    circumpolar: always,
    neverRises: never,
    culminationAlt: best,
    culminationTime: bestT,
    darkMaxAlt: darkMax,
    bestDate,
    months,
    fullLat,
  }
}

export interface BodyRiseSet {
  rise: Date | null
  set: Date | null
  transit: Date | null
  transitAlt: number | null
}

/** Exact rise / set / transit of the Sun, Moon or a planet within the next 24 h (astronomy-engine). */
export function bodyRiseSet(id: keyof typeof Astronomy.Body, from: Date, place: Place): BodyRiseSet {
  const obs = new Astronomy.Observer(place.lat, place.lon, 0)
  const body = Astronomy.Body[id]
  const rise = Astronomy.SearchRiseSet(body, obs, +1, from, 1)
  const set = Astronomy.SearchRiseSet(body, obs, -1, from, 1)
  let transit: Date | null = null
  let transitAlt: number | null = null
  try {
    const h = Astronomy.SearchHourAngle(body, obs, 0, from, +1)
    transit = h.time.date
    transitAlt = h.hor.altitude
  } catch {
    /* ignore */
  }
  return { rise: rise?.date ?? null, set: set?.date ?? null, transit, transitAlt }
}

export function formatLocalTime(d: Date, tz: string, withDate = false): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...(withDate ? { month: 'short', day: 'numeric' } : {}),
  }).format(d)
}

export function compass(az: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(az / 22.5) % 16]
}

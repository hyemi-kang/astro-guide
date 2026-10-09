import { useMemo } from 'react'
import type { BodyId } from '../astro/bodies'
import { type Place, type Vec3 } from '../astro/coords'
import { bodyRiseSet, compass, computeVisibility, formatLocalTime } from '../astro/visibility'
import { twilightName } from '../astro/skyColor'

interface Props {
  vec: Vec3
  extent: { decMin: number; decMax: number }
  place: Place
  date: Date
  /** for Sun / Moon / planets: use exact rise & set search instead of a fixed point */
  bodyId?: BodyId
  /** show the seasonal block (best date, months, latitudes); off for planets that move */
  seasonal?: boolean
}

const fmtAlt = (a: number) => `${Math.abs(a).toFixed(0)}°`

export function VisibilityPanel({ vec, extent, place, date, bodyId, seasonal = true }: Props) {
  const v = useMemo(() => computeVisibility(vec, place, date, extent), [vec, place, date, extent])
  const rs = useMemo(() => (bodyId ? bodyRiseSet(bodyId, date, place) : null), [bodyId, place, date])
  const t = (d: Date | null | undefined, withDate = true) => (d ? formatLocalTime(d, place.tz, withDate) : '—')
  const dark = v.sunAlt < -12
  const twilight = twilightName(v.sunAlt)

  let now: string
  if (!v.up) now = `Below the horizon (${fmtAlt(v.alt)} under it).`
  else if (v.sunAlt > -6) now = `Above the horizon — ${fmtAlt(v.alt)} up toward ${compass(v.az)} — but the sky is too bright (${twilight.toLowerCase()}). Use “Block the Sun” to see it.`
  else now = `Above the horizon — ${fmtAlt(v.alt)} up toward ${compass(v.az)} (${twilight.toLowerCase()}${dark ? '' : ', still fairly bright'}).`

  const rise = rs ? rs.rise : v.rise
  const set = rs ? rs.set : v.set
  const culmTime = rs?.transit ?? v.culminationTime
  const culmAlt = rs?.transitAlt ?? v.culminationAlt

  return (
    <div className="vis">
      <h4>
        From {place.name} <span>· {place.tz}</span>
      </h4>
      <p className={`vis-now ${v.up && v.sunAlt < -6 ? 'good' : ''}`}>{now}</p>
      <dl className="vis-grid">
        <div>
          <dt>Rises</dt>
          <dd>{v.circumpolar ? 'Never sets' : v.neverRises && !rs ? 'Never rises here' : t(rise)}</dd>
        </div>
        <div>
          <dt>Highest point</dt>
          <dd>
            {v.neverRises && !rs ? '—' : `${t(culmTime)} · ${culmAlt.toFixed(0)}°`}
          </dd>
        </div>
        <div>
          <dt>Sets</dt>
          <dd>{v.circumpolar ? 'Never sets' : v.neverRises && !rs ? '—' : t(set)}</dd>
        </div>
        {!bodyId && (
          <div>
            <dt>Dark-sky peak (next 24 h)</dt>
            <dd>{v.darkMaxAlt === null ? 'No dark night' : v.darkMaxAlt < 5 ? 'Not visible tonight' : `${v.darkMaxAlt.toFixed(0)}° altitude`}</dd>
          </div>
        )}
      </dl>
      {seasonal && !bodyId && (
        <dl className="vis-grid">
          <div>
            <dt>Best seen</dt>
            <dd>{v.bestDate} · highest at 9 pm</dd>
          </div>
          <div>
            <dt>Months above 20° in the dark</dt>
            <dd>{v.months.length ? v.months.join(' · ') : 'Never well placed'}</dd>
          </div>
          <div>
            <dt>Whole figure visible from latitudes</dt>
            <dd>{v.fullLat[0] <= v.fullLat[1] ? `${fmtLat(v.fullLat[0])} to ${fmtLat(v.fullLat[1])}` : 'Parts only, anywhere'}</dd>
          </div>
        </dl>
      )}
      <p className="vis-foot">Times are local to the selected place. Altitudes ignore refraction.</p>
    </div>
  )
}

function fmtLat(l: number): string {
  if (l >= 89.5) return '90° N'
  if (l <= -89.5) return '90° S'
  return `${Math.abs(l).toFixed(0)}° ${l >= 0 ? 'N' : 'S'}`
}

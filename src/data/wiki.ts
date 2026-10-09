import { useEffect, useState } from 'react'

export interface WikiSummary {
  title: string
  extract: string
  thumbnail?: string
  /** a real photograph found in the article's media list (JPEG, not a chart or old print) */
  photo?: string
  url: string
  /** image credit/description shown under the polaroid */
  description?: string
}

const cache = new Map<string, Promise<WikiSummary | null>>()

async function fetchSummary(title: string): Promise<(WikiSummary & { type: string }) | null> {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const j = await res.json()
  return {
    type: j.type,
    title: j.title,
    extract: j.extract ?? '',
    thumbnail: j.originalimage?.source && j.originalimage.width < 2600 ? j.originalimage.source : j.thumbnail?.source,
    url: j.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    description: j.description,
  }
}

const NOT_A_PHOTO = /(map|chart|atlas|IAU|Urania|Hevelius|Bayer|Ptolemy|Almagest|Flamsteed|illustration|diagram|symbol|zodiac|astrolog|icon|logo|flag|Wikisource|Ambox|Question|Portal|stub|Commons-|Wiktionary|Wikiquote|Decrease|Increase|Lock|Crab_Nebula_Supernova|Sidney|manuscript|constellation_figure|skymap|sky_map|label|annotated|Pseudo)/i

/** Look through an article's images for a real astronomical photograph (JPEG), skipping charts and engravings. */
async function findPhoto(title: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title.replace(/ /g, '_'))}`)
    if (!res.ok) return undefined
    const j = (await res.json()) as { items?: { title: string; type: string; srcset?: { src: string; scale: string }[] }[] }
    for (const it of j.items ?? []) {
      if (it.type !== 'image' || !/\.jpe?g$/i.test(it.title) || NOT_A_PHOTO.test(it.title)) continue
      const set = it.srcset ?? []
      const best = set.find((s) => s.scale === '2x') ?? set[set.length - 1]
      if (best) return best.src.startsWith('//') ? `https:${best.src}` : best.src
    }
  } catch {
    /* ignore — the chart fallback covers it */
  }
  return undefined
}

/**
 * Resolve the first candidate title that is a real article (not a disambiguation page)
 * and, when `must` is given, whose description or extract mentions it.
 */
export function lookupWiki(candidates: string[], must?: RegExp, wantPhoto = false): Promise<WikiSummary | null> {
  const key = candidates.join('|') + (must?.source ?? '') + (wantPhoto ? '|photo' : '')
  let p = cache.get(key)
  if (!p) {
    p = (async () => {
      for (const c of candidates) {
        try {
          const s = await fetchSummary(c)
          if (!s || s.type === 'disambiguation') continue
          if (must && !must.test(`${s.description ?? ''} ${s.extract.slice(0, 240)}`)) continue
          if (wantPhoto) s.photo = await findPhoto(s.title)
          return s
        } catch {
          return null
        }
      }
      return null
    })()
    cache.set(key, p)
  }
  return p
}

export function useWiki(candidates: string[] | null, must?: RegExp, wantPhoto = false) {
  const [state, setState] = useState<{ loading: boolean; data: WikiSummary | null }>({ loading: !!candidates, data: null })
  const key = candidates?.join('|') ?? ''
  useEffect(() => {
    if (!candidates) {
      setState({ loading: false, data: null })
      return
    }
    let live = true
    setState({ loading: true, data: null })
    lookupWiki(candidates, must, wantPhoto).then((data) => live && setState({ loading: false, data }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}

export function constellationWikiTitles(name: string, latin: string, override?: string): string[] {
  if (override) return [override]
  return [`${latin} (constellation)`, `${name} (constellation)`, latin, name]
}

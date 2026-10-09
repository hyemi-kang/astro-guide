import type { Catalog } from '../data/loadCatalog'

export const MW_W = 1440
export const MW_H = 720

export interface MilkyWayTexture {
  /** 0–255 brightness, equirectangular, x = RA wrapped to −180…180°, y = 90°…−90° declination */
  lum: Uint8Array
}

/**
 * Rasterise the d3-celestial Milky Way outlines (5 nested brightness levels, from the
 * Hipparcos/Tycho-era isophotes) into an equirectangular brightness map, then blur it.
 */
export function buildMilkyWay(catalog: Catalog): MilkyWayTexture {
  const c = document.createElement('canvas')
  c.width = MW_W
  c.height = MW_H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, MW_W, MW_H)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  const X = (lon: number) => ((lon + 180) / 360) * MW_W
  const Y = (dec: number) => ((90 - dec) / 180) * MW_H
  for (const f of catalog.mwFeatures) {
    for (const poly of f.coordinates) {
      ctx.beginPath()
      for (const ring of poly) {
        ring.forEach(([lon, lat], i) => (i === 0 ? ctx.moveTo(X(lon), Y(lat)) : ctx.lineTo(X(lon), Y(lat))))
        ctx.closePath()
      }
      ctx.fill('evenodd')
    }
  }
  const b = document.createElement('canvas')
  b.width = MW_W
  b.height = MW_H
  const bctx = b.getContext('2d')!
  bctx.filter = 'blur(7px)'
  bctx.drawImage(c, 0, 0)
  const px = bctx.getImageData(0, 0, MW_W, MW_H).data
  const lum = new Uint8Array(MW_W * MW_H)
  for (let i = 0; i < lum.length; i++) lum[i] = px[i * 4]
  return { lum }
}

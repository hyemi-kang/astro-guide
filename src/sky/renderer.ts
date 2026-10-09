import { DEG, IDENTITY, type Mat3, type Vec3, eqjToHorizon, mulMat, toAltAz } from '../astro/coords'
import { type BodyState, computeBodies } from '../astro/bodies'
import { type Camera, type View, makeCamera, project } from '../astro/projection'
import { rgb, skyLook, type RGB } from '../astro/skyColor'
import { bvToRGB } from '../astro/starColor'
import type { Catalog, ConstellationData } from '../data/loadCatalog'
import type { Mode } from '../store/useAppStore'
import { MW_H, MW_W, type MilkyWayTexture } from './milkyWay'
import { skyInfo } from './skyBus'

export interface Flags {
  lines: boolean
  labels: boolean
  borders: boolean
  dso: boolean
}

export interface FrameInput {
  w: number
  h: number
  dpr: number
  timeMs: number
  date: Date
  lat: number
  lon: number
  place: { lat: number; lon: number; tz: string; name: string }
  mode: Mode
  view: View
  flags: Flags
  highlightCon: string | null
  hoverStar: number | null
}

export type Hit =
  | { kind: 'body'; id: string; x: number; y: number }
  | { kind: 'star'; i: number; hip: number; x: number; y: number }
  | { kind: 'dso'; id: string; x: number; y: number }
  | { kind: 'constellation'; id: string; x: number; y: number }

const PLANET_COLOR: Record<string, RGB> = {
  Mercury: [200, 190, 180],
  Venus: [255, 245, 215],
  Mars: [255, 150, 110],
  Jupiter: [255, 235, 200],
  Saturn: [245, 225, 170],
  Uranus: [170, 235, 240],
  Neptune: [140, 170, 255],
}
const BODY_LABEL: Record<string, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  Uranus: 'Uranus',
  Neptune: 'Neptune',
}

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface Tree {
  az: number
  h: number
  w: number
  kind: 0 | 1
}

const OBLIQUITY = 23.4393 * DEG

export class SkyRenderer {
  private sprites: HTMLCanvasElement[] = []
  private lowMW = document.createElement('canvas')
  private lowGround = document.createElement('canvas')
  private trees: Tree[] = []
  private bodiesCache: { key: number; bodies: BodyState[] } | null = null
  private cam!: Camera
  private frameMat: Mat3 = IDENTITY
  private input!: FrameInput
  bodies: BodyState[] = []
  // projected hit-test targets (filled during render)
  private hitStarX: Float32Array
  private hitStarY: Float32Array
  private hitStarI: Int32Array
  private hitStarCount = 0
  private bodyPos: { id: string; x: number; y: number; r: number }[] = []
  private dsoPos: { id: string; x: number; y: number; r: number }[] = []

  constructor(
    private catalog: Catalog,
    private mw: MilkyWayTexture,
  ) {
    this.hitStarX = new Float32Array(catalog.stars.n)
    this.hitStarY = new Float32Array(catalog.stars.n)
    this.hitStarI = new Int32Array(catalog.stars.n)
    for (let k = 0; k < 12; k++) this.sprites.push(this.makeSprite(bvToRGB(-0.35 + (k / 11) * 2.2)))
    const rnd = seeded(20260101)
    const n = 54
    for (let i = 0; i < n; i++) {
      this.trees.push({
        az: (i / n) * 360 + (rnd() - 0.5) * 4,
        h: 2.6 + rnd() * 3.6,
        w: 0.34 + rnd() * 0.16,
        kind: rnd() < 0.62 ? 0 : 1,
      })
    }
  }

  private makeSprite(c: RGB): HTMLCanvasElement {
    const s = document.createElement('canvas')
    s.width = s.height = 64
    const g = s.getContext('2d')!
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.12, rgb(c, 0.95))
    grad.addColorStop(0.35, rgb(c, 0.32))
    grad.addColorStop(1, rgb(c, 0))
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
    return s
  }

  getBodies(): BodyState[] {
    return this.bodies
  }

  getCamera(): Camera {
    return this.cam
  }

  getFrameMat(): Mat3 {
    return this.frameMat
  }

  // ---------------------------------------------------------------------
  render(ctx: CanvasRenderingContext2D, inp: FrameInput) {
    this.input = inp
    const { w, h, dpr, mode } = inp
    const horizonMode = mode !== 'space'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    this.frameMat = horizonMode ? eqjToHorizon(inp.date, inp.place) : IDENTITY
    const cam = makeCamera(inp.view, w, h)
    this.cam = cam
    const M = this.frameMat

    const key = Math.floor(inp.date.getTime() / 1000)
    if (!this.bodiesCache || this.bodiesCache.key !== key) {
      this.bodiesCache = { key, bodies: computeBodies(inp.date, inp.place) }
    }
    this.bodies = this.bodiesCache.bodies
    const sunB = this.bodies[0]
    const sunF = mulMat(M, sunB.vec)
    const trueSunAlt = horizonMode ? Math.asin(clamp(sunF[2], -1, 1)) / DEG : -90
    const dark = skyInfo.dark
    const effAlt = horizonMode ? lerp(trueSunAlt, Math.min(trueSunAlt, -26), dark) : -90
    const look = skyLook(effAlt)
    const lm = horizonMode ? look.limitingMag : 7.2
    skyInfo.w = w
    skyInfo.h = h
    skyInfo.sunAlt = effAlt
    skyInfo.trueSunAlt = trueSunAlt
    if (horizonMode) skyInfo.sunAz = toAltAz(sunF).az

    // ---- sky gradient ---------------------------------------------------
    this.drawSkyBackground(ctx, inp, look, horizonMode)

    // ---- sun glow ---------------------------------------------------------
    const sp = project(cam, sunF)
    const sunVisibleGeom = sp.c > 0.1 && sp.x > -50 && sp.x < w + 50 && sp.y > -50 && sp.y < h + 50
    skyInfo.sunX = sp.x
    skyInfo.sunY = sp.y
    skyInfo.sunOnScreen = horizonMode && trueSunAlt > -2 && sunVisibleGeom
    if (horizonMode && sp.c > -0.3 && trueSunAlt > -14) {
      const intensity = clamp((trueSunAlt + 14) / 14, 0, 1) * (1 - dark * 0.92)
      const rad = Math.min(w, h) * 0.9
      const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, rad)
      const warm = clamp(1 - trueSunAlt / 25, 0, 1)
      g.addColorStop(0, `rgba(255,${(240 - 60 * warm) | 0},${(200 - 110 * warm) | 0},${0.55 * intensity})`)
      g.addColorStop(0.18, `rgba(255,${(200 - 50 * warm) | 0},${(150 - 70 * warm) | 0},${0.22 * intensity})`)
      g.addColorStop(1, 'rgba(255,170,110,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    // ---- low-res pass: Milky Way + ground mask --------------------------------
    const mwAlpha = clamp((lm - 3.2) / 3.2, 0, 1) * (horizonMode ? 1 : 1.25)
    this.drawLowRes(ctx, inp, cam, M, horizonMode, look, mwAlpha)

    // ---- space-mode reference grid -------------------------------------------
    if (!horizonMode) this.drawCelestialGrid(ctx, cam)

    // ---- borders / deep-sky --------------------------------------------------
    if (inp.flags.borders || (inp.highlightCon && this.catalog.byId.has(inp.highlightCon))) {
      this.drawBorders(ctx, cam, M, inp.flags.borders, inp.highlightCon)
    }
    this.dsoPos.length = 0
    if (inp.flags.dso) this.drawDsos(ctx, cam, M, lm, horizonMode)

    // ---- constellation lines ----------------------------------------------------
    this.drawConstellations(ctx, inp, cam, M, horizonMode)

    // ---- stars -----------------------------------------------------------------
    this.drawStars(ctx, inp, cam, M, lm, horizonMode)

    // ---- planets, moon, sun ----------------------------------------------------------
    this.drawBodies(ctx, inp, cam, M, lm, horizonMode, trueSunAlt)

    // ---- ground ----------------------------------------------------------------------
    if (horizonMode) {
      ctx.globalAlpha = 1
      ctx.drawImage(this.lowGround, 0, 0, w, h)
      if (mode === 'park') this.drawTrees(ctx, cam, look)
      this.drawCompass(ctx, cam, look)
    }
  }

  // ---------------------------------------------------------------------
  private drawSkyBackground(ctx: CanvasRenderingContext2D, inp: FrameInput, look: ReturnType<typeof skyLook>, horizonMode: boolean) {
    const { w, h } = inp
    if (!horizonMode) {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75)
      g.addColorStop(0, '#05070f')
      g.addColorStop(1, '#010206')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      return
    }
    const cam = this.cam
    const zen = project(cam, [0, 0, 1])
    const a = -inp.view.yaw * DEG // azimuth of view direction
    const hv: Vec3 = [Math.cos(a), -Math.sin(a), 0]
    const hor = project(cam, hv)
    const dist = Math.hypot(zen.x - hor.x, zen.y - hor.y)
    if (dist < 2 || zen.c < -0.2) {
      ctx.fillStyle = rgb(look.top)
    } else {
      // push the gradient start beyond the zenith so the sky keeps some depth when looking low
      const g = ctx.createLinearGradient(zen.x, zen.y, hor.x, hor.y)
      g.addColorStop(0, rgb(look.top))
      g.addColorStop(0.55, rgb([lerp(look.top[0], look.bottom[0], 0.55), lerp(look.top[1], look.bottom[1], 0.55), lerp(look.top[2], look.bottom[2], 0.55)]))
      g.addColorStop(1, rgb(look.bottom))
      ctx.fillStyle = g
    }
    ctx.fillRect(0, 0, w, h)
  }

  // ---------------------------------------------------------------------
  private drawLowRes(
    ctx: CanvasRenderingContext2D,
    inp: FrameInput,
    cam: Camera,
    M: Mat3,
    horizonMode: boolean,
    look: ReturnType<typeof skyLook>,
    mwAlpha: number,
  ) {
    const LR = 4
    const lw = Math.max(2, Math.ceil(inp.w / LR))
    const lh = Math.max(2, Math.ceil(inp.h / LR))
    const needMW = mwAlpha > 0.02
    const needGround = horizonMode
    if (!needMW && !needGround) return
    for (const c of [this.lowMW, this.lowGround]) {
      if (c.width !== lw || c.height !== lh) {
        c.width = lw
        c.height = lh
      }
    }
    const mwCtx = this.lowMW.getContext('2d')!
    const gCtx = this.lowGround.getContext('2d')!
    const mwImg = needMW ? mwCtx.createImageData(lw, lh) : null
    const gImg = needGround ? gCtx.createImageData(lw, lh) : null
    const md = mwImg?.data
    const gd = gImg?.data

    const { d, right, up, scale, cx, cy } = cam
    const lum = this.mw.lum
    const park = inp.mode === 'park'
    const day = look.daylight
    // ground colours: [deep, haze]
    const deep: RGB = park
      ? [lerp(24, 52, day), lerp(40, 96, day), lerp(44, 58, day)]
      : [lerp(18, 40, day), lerp(30, 60, day), lerp(48, 66, day)]
    // near the horizon the ground picks up the glow of the sky (and never drops below a readable night tone)
    const haze: RGB = [Math.max(lerp(look.bottom[0], deep[0], 0.45), deep[0] + 12), Math.max(lerp(look.bottom[1], deep[1], 0.45), deep[1] + 14), Math.max(lerp(look.bottom[2], deep[2], 0.45), deep[2] + 22)]
    const tint = [200, 214, 255]

    for (let py = 0; py < lh; py++) {
      const Y = -((py + 0.5) * LR - cy) / scale
      for (let px = 0; px < lw; px++) {
        const X = ((px + 0.5) * LR - cx) / scale
        const r2 = X * X + Y * Y
        const den = 4 + r2
        const c = (4 - r2) / den
        const k = 4 / den
        const f0 = c * d[0] + k * (X * right[0] + Y * up[0])
        const f1 = c * d[1] + k * (X * right[1] + Y * up[1])
        const f2 = c * d[2] + k * (X * right[2] + Y * up[2])
        const o = (py * lw + px) * 4
        if (gd) {
          // horizon-frame z is the sine of altitude
          const z = f2
          const a = clamp(-z / 0.012 + 0.5, 0, 1)
          if (a > 0) {
            const t = Math.pow(clamp(-z / 0.4, 0, 1), 0.55)
            gd[o] = lerp(haze[0], deep[0], t)
            gd[o + 1] = lerp(haze[1], deep[1], t)
            gd[o + 2] = lerp(haze[2], deep[2], t)
            gd[o + 3] = a * 255
          }
        }
        if (md) {
          // frame → EQJ (transpose of the EQJ→horizon matrix)
          let e0 = f0
          let e1 = f1
          let e2 = f2
          if (horizonMode) {
            e0 = M[0] * f0 + M[3] * f1 + M[6] * f2
            e1 = M[1] * f0 + M[4] * f1 + M[7] * f2
            e2 = M[2] * f0 + M[5] * f1 + M[8] * f2
          }
          let lon = Math.atan2(e1, e0) / DEG
          if (lon > 180) lon -= 360
          const dec = Math.asin(clamp(e2, -1, 1)) / DEG
          const tx = clamp(Math.floor(((lon + 180) / 360) * MW_W), 0, MW_W - 1)
          const ty = clamp(Math.floor(((90 - dec) / 180) * MW_H), 0, MW_H - 1)
          const l = lum[ty * MW_W + tx]
          if (l > 0) {
            md[o] = tint[0]
            md[o + 1] = tint[1]
            md[o + 2] = tint[2]
            md[o + 3] = Math.min(255, l * mwAlpha * 0.62)
          }
        }
      }
    }
    if (gImg) gCtx.putImageData(gImg, 0, 0)
    if (mwImg) {
      mwCtx.putImageData(mwImg, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(this.lowMW, 0, 0, inp.w, inp.h)
    }
  }

  // ---------------------------------------------------------------------
  private drawCelestialGrid(ctx: CanvasRenderingContext2D, cam: Camera) {
    const p = { x: 0, y: 0, c: 0 }
    const line = (pts: Vec3[], style: string, width: number, dash: number[] = []) => {
      ctx.beginPath()
      let pen = false
      for (const v of pts) {
        project(cam, v, p)
        if (p.c < -0.3) {
          pen = false
          continue
        }
        if (pen) ctx.lineTo(p.x, p.y)
        else ctx.moveTo(p.x, p.y)
        pen = true
      }
      ctx.strokeStyle = style
      ctx.lineWidth = width
      ctx.setLineDash(dash)
      ctx.stroke()
      ctx.setLineDash([])
    }
    // RA/Dec grid
    for (let ra = 0; ra < 360; ra += 30) {
      const pts: Vec3[] = []
      for (let dec = -85; dec <= 85; dec += 5) pts.push([Math.cos(dec * DEG) * Math.cos(ra * DEG), Math.cos(dec * DEG) * Math.sin(ra * DEG), Math.sin(dec * DEG)])
      line(pts, 'rgba(120,150,220,0.10)', 1)
    }
    for (let dec = -60; dec <= 60; dec += 30) {
      if (dec === 0) continue
      const pts: Vec3[] = []
      for (let ra = 0; ra <= 360; ra += 4) pts.push([Math.cos(dec * DEG) * Math.cos(ra * DEG), Math.cos(dec * DEG) * Math.sin(ra * DEG), Math.sin(dec * DEG)])
      line(pts, 'rgba(120,150,220,0.10)', 1)
    }
    // celestial equator
    const eq: Vec3[] = []
    for (let ra = 0; ra <= 360; ra += 3) eq.push([Math.cos(ra * DEG), Math.sin(ra * DEG), 0])
    line(eq, 'rgba(110,190,255,0.28)', 1.2)
    // ecliptic
    const ec: Vec3[] = []
    for (let l = 0; l <= 360; l += 3) ec.push([Math.cos(l * DEG), Math.sin(l * DEG) * Math.cos(OBLIQUITY), Math.sin(l * DEG) * Math.sin(OBLIQUITY)])
    line(ec, 'rgba(255,205,120,0.32)', 1.2, [6, 5])
    // pole labels
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'left'
    const tag = (v: Vec3, text: string, col: string) => {
      project(cam, v, p)
      if (p.c < 0) return
      ctx.fillStyle = col
      ctx.fillText(text, p.x + 6, p.y - 6)
    }
    tag([0, 0, 1], 'North celestial pole', 'rgba(150,200,255,0.55)')
    tag([0, 0, -1], 'South celestial pole', 'rgba(150,200,255,0.55)')
    tag([1, 0, 0], 'Celestial equator · RA 0h', 'rgba(150,200,255,0.4)')
    tag([Math.cos(90 * DEG), Math.sin(90 * DEG) * Math.cos(OBLIQUITY), Math.sin(90 * DEG) * Math.sin(OBLIQUITY)], 'Ecliptic', 'rgba(255,215,140,0.5)')
  }

  // ---------------------------------------------------------------------
  private drawBorders(ctx: CanvasRenderingContext2D, cam: Camera, M: Mat3, all: boolean, only: string | null) {
    const p = { x: 0, y: 0, c: 0 }
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    for (const b of this.catalog.borders) {
      const hot = only !== null && b.ids.includes(only)
      if (!all && !hot) continue
      ctx.strokeStyle = hot ? 'rgba(255,214,140,0.55)' : 'rgba(150,170,220,0.2)'
      ctx.beginPath()
      let pen = false
      for (const v of b.points) {
        project(cam, mulMat(M, v), p)
        if (p.c < -0.2) {
          pen = false
          continue
        }
        if (pen) ctx.lineTo(p.x, p.y)
        else ctx.moveTo(p.x, p.y)
        pen = true
      }
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  // ---------------------------------------------------------------------
  private drawDsos(ctx: CanvasRenderingContext2D, cam: Camera, M: Mat3, lm: number, horizonMode: boolean) {
    const p = { x: 0, y: 0, c: 0 }
    const { w, h } = this.input
    for (const o of this.catalog.dsos) {
      const f = mulMat(M, o.vec)
      if (horizonMode && f[2] < -0.02) continue
      project(cam, f, p)
      if (p.c < 0.05 || p.x < -80 || p.x > w + 80 || p.y < -80 || p.y > h + 80) continue
      const mag = Number.isFinite(o.mag) ? o.mag : 7
      const vis = horizonMode ? clamp((lm - mag + 4) / 4, 0, 1) : 0.9
      if (vis < 0.05) continue
      const k = 2 / (1 + p.c)
      const rpx = Math.max(5, ((o.size / 60) * DEG * cam.scale * k) / 2)
      const r = Math.min(rpx, 220)
      this.dsoPos.push({ id: o.id, x: p.x, y: p.y, r: Math.max(r, 9) })
      const tint: RGB = o.kind === 'Galaxy' ? [170, 190, 255] : o.kind === 'Open cluster' || o.kind === 'Globular cluster' ? [255, 240, 200] : o.kind === 'Dark nebula' ? [120, 120, 130] : [255, 150, 190]
      if (o.kind === 'Dark nebula') {
        // dark nebulae: a subtle dark patch only
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        g.addColorStop(0, `rgba(0,0,0,${0.22 * vis})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        continue
      }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
      g.addColorStop(0, rgb(tint, 0.55 * vis))
      g.addColorStop(0.4, rgb(tint, 0.2 * vis))
      g.addColorStop(1, rgb(tint, 0))
      ctx.fillStyle = g
      ctx.beginPath()
      if (o.kind === 'Galaxy') ctx.ellipse(p.x, p.y, r, r * 0.45, -0.5, 0, Math.PI * 2)
      else ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
      if (o.kind === 'Open cluster' || o.kind === 'Globular cluster') {
        ctx.strokeStyle = rgb(tint, 0.35 * vis)
        ctx.setLineDash([2, 3])
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(r * 0.8, 7), 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }
  }

  // ---------------------------------------------------------------------
  private drawConstellations(ctx: CanvasRenderingContext2D, inp: FrameInput, cam: Camera, M: Mat3, horizonMode: boolean) {
    const p = { x: 0, y: 0, c: 0 }
    const { flags, highlightCon } = inp
    const lm = skyLook(skyInfo.sunAlt).limitingMag
    const night = horizonMode ? clamp((lm - 1) / 4, 0, 1) : 1
    const drawOne = (c: ConstellationData, style: string, width: number) => {
      ctx.strokeStyle = style
      ctx.lineWidth = width
      ctx.beginPath()
      for (const poly of c.lines) {
        let pen = false
        for (const v of poly) {
          const f = mulMat(M, v)
          project(cam, f, p)
          if (p.c < -0.3 || (horizonMode && f[2] < -0.12)) {
            pen = false
            continue
          }
          if (pen) ctx.lineTo(p.x, p.y)
          else ctx.moveTo(p.x, p.y)
          pen = true
        }
      }
      ctx.stroke()
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (flags.lines) {
      for (const c of this.catalog.constellations) {
        if (c.id === highlightCon) continue
        drawOne(c, `rgba(150,185,255,${0.28 * Math.max(night, 0.25)})`, 1)
      }
    }
    if (highlightCon) {
      const c = this.catalog.byId.get(highlightCon)
      if (c) {
        ctx.shadowColor = 'rgba(255,214,140,0.9)'
        ctx.shadowBlur = 10
        drawOne(c, 'rgba(255,224,160,0.95)', 1.8)
        ctx.shadowBlur = 0
        // node rings on the figure's vertices
        ctx.fillStyle = 'rgba(255,230,180,0.9)'
        for (const poly of c.lines) {
          for (const v of poly) {
            const f = mulMat(M, v)
            project(cam, f, p)
            if (p.c < -0.3 || (horizonMode && f[2] < -0.12)) continue
            ctx.beginPath()
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }
    // names
    if (flags.labels && inp.view.fov < 118) {
      ctx.font = '500 11px Inter, sans-serif'
      ctx.textAlign = 'center'
      for (const c of this.catalog.constellations) {
        const f = mulMat(M, c.centerVec)
        if (horizonMode && f[2] < 0.03) continue
        project(cam, f, p)
        if (p.c < 0.1 || p.x < 20 || p.x > inp.w - 20 || p.y < 20 || p.y > inp.h - 20) continue
        const hot = c.id === highlightCon
        const a = hot ? 0.95 : 0.42 * Math.max(night, 0.3)
        ctx.fillStyle = hot ? `rgba(255,228,170,${a})` : `rgba(190,210,255,${a})`
        this.spacedText(ctx, c.name.toUpperCase(), p.x, p.y)
      }
    }
  }

  private spacedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    const sp = 1.6
    const chars = [...text]
    const widths = chars.map((ch) => ctx.measureText(ch).width + sp)
    const total = widths.reduce((a, b) => a + b, 0) - sp
    let cx = x - total / 2
    ctx.textAlign = 'left'
    chars.forEach((ch, i) => {
      ctx.fillText(ch, cx, y)
      cx += widths[i]
    })
    ctx.textAlign = 'center'
  }

  // ---------------------------------------------------------------------
  private drawStars(ctx: CanvasRenderingContext2D, inp: FrameInput, cam: Camera, M: Mat3, lm: number, horizonMode: boolean) {
    const st = this.catalog.stars
    const { w, h, timeMs } = inp
    const { d, right, up, scale, cx, cy } = cam
    const t = timeMs / 1000
    const zoomK = Math.pow(60 / inp.view.fov, 0.3)
    const space = !horizonMode
    this.hitStarCount = 0
    const labelLimit = 1.9 + clamp(60 / inp.view.fov - 1, 0, 3) * 0.9
    ctx.globalCompositeOperation = 'lighter'
    const labels: { x: number; y: number; text: string; a: number }[] = []
    for (let i = 0; i < st.n; i++) {
      const vx = st.vec[i * 3]
      const vy = st.vec[i * 3 + 1]
      const vz = st.vec[i * 3 + 2]
      const f0 = M[0] * vx + M[1] * vy + M[2] * vz
      const f1 = M[3] * vx + M[4] * vy + M[5] * vz
      const f2 = M[6] * vx + M[7] * vy + M[8] * vz
      if (horizonMode && f2 < -0.01) continue
      const c = f0 * d[0] + f1 * d[1] + f2 * d[2]
      if (c < -0.5) continue
      const k = 2 / (1 + c)
      const x = cx + k * (f0 * right[0] + f1 * right[1] + f2 * right[2]) * scale
      const y = cy - k * (f0 * up[0] + f1 * up[1] + f2 * up[2]) * scale
      if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue
      const mag = st.mag[i]
      let a = clamp((lm - mag + 0.4) / 1.9, 0, 1)
      if (a <= 0.01) continue
      // atmospheric extinction near the horizon (altitude ≈ f2)
      let twinkleAmp = 0.1
      if (horizonMode) {
        const alt = Math.max(f2, 0.001)
        const airmass = 1 / (alt + 0.04)
        a *= clamp(1 - 0.09 * (airmass - 1) * 0.35, 0.35, 1)
        twinkleAmp = 0.14 + clamp(airmass - 1, 0, 6) * 0.05
      }
      const hip = st.hip[i]
      const ph = (hip * 12.9898) % 6.283
      const tw = 1 + twinkleAmp * (Math.sin(t * (1.8 + (hip % 7) * 0.37) + ph) * 0.6 + Math.sin(t * 5.1 + ph * 2.0) * 0.4) * (space ? 0.8 : 1)
      const r = (0.55 + 0.5 * Math.pow(Math.max(6.4 - mag, 0), 1.18)) * zoomK * (space ? 1.08 : 1)
      const alpha = clamp(a * tw, 0, 1)
      const bucket = clamp(Math.floor(((st.bv[i] + 0.4) / 2.4) * 12), 0, 11)
      if (r < 1.6) {
        ctx.globalAlpha = alpha
        ctx.drawImage(this.sprites[bucket], x - r * 1.9, y - r * 1.9, r * 3.8, r * 3.8)
      } else {
        ctx.globalAlpha = alpha * 0.9
        const s = r * 5.2
        ctx.drawImage(this.sprites[bucket], x - s / 2, y - s / 2, s, s)
        if (mag < 1.2) {
          // diffraction spikes on the brightest stars
          ctx.globalAlpha = alpha * 0.35
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 0.8
          const L = r * 4.2
          ctx.beginPath()
          ctx.moveTo(x - L, y)
          ctx.lineTo(x + L, y)
          ctx.moveTo(x, y - L)
          ctx.lineTo(x, y + L)
          ctx.stroke()
        }
      }
      if (mag < 4.6 && st.names.has(hip)) {
        const n = this.hitStarCount++
        this.hitStarX[n] = x
        this.hitStarY[n] = y
        this.hitStarI[n] = i
        const nm = st.names.get(hip)!
        if (nm.name && flagsLabel(inp) && mag < labelLimit) labels.push({ x, y, text: nm.name, a: alpha })
      }
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.font = '500 11px Inter, sans-serif'
    ctx.textAlign = 'left'
    for (const l of labels) {
      ctx.fillStyle = `rgba(214,226,255,${0.62 * l.a})`
      ctx.fillText(l.text, l.x + 8, l.y + 14)
    }
    // hovered star ring
    if (inp.hoverStar !== null) {
      const i = inp.hoverStar
      for (let n = 0; n < this.hitStarCount; n++) {
        if (this.hitStarI[n] === i) {
          ctx.strokeStyle = 'rgba(255,224,160,0.9)'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(this.hitStarX[n], this.hitStarY[n], 11, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }
  }

  // ---------------------------------------------------------------------
  private drawBodies(ctx: CanvasRenderingContext2D, inp: FrameInput, cam: Camera, M: Mat3, lm: number, horizonMode: boolean, trueSunAlt: number) {
    const p = { x: 0, y: 0, c: 0 }
    const sunP = project(cam, mulMat(M, this.bodies[0].vec))
    const t = inp.timeMs / 1000
    this.bodyPos.length = 0
    ctx.textAlign = 'left'
    ctx.font = '500 11px Inter, sans-serif'
    for (const b of this.bodies) {
      const f = mulMat(M, b.vec)
      if (horizonMode && f[2] < -0.015) continue
      project(cam, f, p)
      if (p.c < 0.0 || p.x < -60 || p.x > inp.w + 60 || p.y < -60 || p.y > inp.h + 60) continue
      const k = 2 / (1 + p.c)
      const realR = ((b.diameterArcsec / 3600) * DEG * cam.scale * k) / 2
      if (b.id === 'Sun') {
        const r = Math.max(realR, 11)
        skyInfo.sunRadiusPx = r
        const visible = trueSunAlt > -2
        this.bodyPos.push({ id: 'Sun', x: p.x, y: p.y, r: r + 8 })
        if (!visible) continue
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2)
        g.addColorStop(0, 'rgba(255,255,240,1)')
        g.addColorStop(0.3, 'rgba(255,236,170,0.9)')
        g.addColorStop(1, 'rgba(255,200,110,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fffbe8'
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        continue
      }
      if (b.id === 'Moon') {
        const r = Math.max(realR, 10)
        const a = clamp((lm + 14) / 10, 0.25, 1)
        this.bodyPos.push({ id: 'Moon', x: p.x, y: p.y, r: r + 8 })
        ctx.save()
        ctx.globalAlpha = a
        // soft halo
        const hg = ctx.createRadialGradient(p.x, p.y, r * 0.8, p.x, p.y, r * 3.6)
        hg.addColorStop(0, `rgba(230,236,255,${0.28 * b.phaseFraction})`)
        hg.addColorStop(1, 'rgba(230,236,255,0)')
        ctx.fillStyle = hg
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 3.6, 0, Math.PI * 2)
        ctx.fill()
        // earthshine disc
        ctx.fillStyle = 'rgba(70,80,105,0.9)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        // lit part — the bright limb faces the Sun
        const ang = Math.atan2(sunP.y - p.y, sunP.x - p.x)
        ctx.translate(p.x, p.y)
        ctx.rotate(ang)
        ctx.fillStyle = '#f4f1e4'
        ctx.beginPath()
        ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false)
        const ax = r * Math.abs(1 - 2 * b.phaseFraction)
        ctx.ellipse(0, 0, Math.max(ax, 0.01), r, 0, Math.PI / 2, -Math.PI / 2, b.phaseFraction < 0.5)
        ctx.fill()
        ctx.restore()
        ctx.fillStyle = `rgba(226,232,255,${0.7 * a})`
        ctx.fillText('Moon', p.x + r + 6, p.y + 4)
        continue
      }
      const a = clamp((lm - b.mag + 0.6) / 1.4, 0, 1)
      if (a < 0.02) continue
      const col = PLANET_COLOR[b.id] ?? [255, 255, 255]
      const r = clamp(2.1 + (1.2 - b.mag) * 0.8, 2.2, 7.5) * Math.pow(60 / inp.view.fov, 0.15)
      const tw = 1 + 0.06 * Math.sin(t * 2.3 + b.mag * 9)
      this.bodyPos.push({ id: b.id, x: p.x, y: p.y, r: 16 })
      ctx.globalCompositeOperation = 'lighter'
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4)
      g.addColorStop(0, rgb(col, 0.9 * a * tw))
      g.addColorStop(0.3, rgb(col, 0.28 * a))
      g.addColorStop(1, rgb(col, 0))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = rgb([255, 255, 255], a)
      ctx.beginPath()
      ctx.arc(p.x, p.y, r * 0.55, 0, Math.PI * 2)
      ctx.fill()
      if (b.id === 'Saturn') {
        ctx.strokeStyle = rgb(col, 0.55 * a)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, r * 1.5, r * 0.45, -0.35, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = rgb([255, 236, 190], 0.82 * a)
      ctx.fillText(BODY_LABEL[b.id], p.x + r + 7, p.y + 4)
    }
  }

  // ---------------------------------------------------------------------
  private drawTrees(ctx: CanvasRenderingContext2D, cam: Camera, look: ReturnType<typeof skyLook>) {
    const day = look.daylight
    const col = rgb([lerp(6, 24, day), lerp(10, 62, day), lerp(14, 42, day)])
    const colBack = rgb([lerp(12, 34, day), lerp(22, 80, day), lerp(30, 58, day)])
    const p0 = { x: 0, y: 0, c: 0 }
    const p1 = { x: 0, y: 0, c: 0 }
    const at = (azDeg: number, alt: number): Vec3 => {
      const a = azDeg * DEG
      const e = alt * DEG
      return [Math.cos(e) * Math.cos(a), -Math.cos(e) * Math.sin(a), Math.sin(e)]
    }
    for (const layer of [0, 1]) {
      ctx.fillStyle = layer === 0 ? colBack : col
      for (let i = 0; i < this.trees.length; i++) {
        const tr = this.trees[i]
        if ((i % 2 === 0 ? 0 : 1) !== layer) continue
        const az = tr.az + (layer === 0 ? 3 : 0)
        project(cam, at(az, layer === 0 ? 0 : -0.6), p0)
        if (p0.c < 0.1) continue
        project(cam, at(az, tr.h * (layer === 0 ? 0.75 : 1)), p1)
        const height = Math.hypot(p1.x - p0.x, p1.y - p0.y)
        if (height < 3 || p0.x < -200 || p0.x > this.input.w + 200) continue
        const wd = height * tr.w
        const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x)
        ctx.save()
        ctx.translate(p0.x, p0.y)
        ctx.rotate(ang + Math.PI / 2)
        // local frame: tree grows toward −y
        ctx.beginPath()
        if (tr.kind === 0) {
          for (let s = 0; s < 3; s++) {
            const top = -height * (0.45 + s * 0.28)
            const base = -height * (0.12 + s * 0.26)
            const half = wd * (1 - s * 0.26)
            ctx.moveTo(0, top - height * 0.1)
            ctx.lineTo(half, base)
            ctx.lineTo(-half, base)
            ctx.closePath()
          }
          ctx.rect(-wd * 0.07, -height * 0.16, wd * 0.14, height * 0.2)
        } else {
          ctx.ellipse(0, -height * 0.66, wd * 0.82, height * 0.36, 0, 0, Math.PI * 2)
          ctx.rect(-wd * 0.07, -height * 0.4, wd * 0.14, height * 0.46)
        }
        ctx.fill()
        ctx.restore()
      }
    }
  }

  private drawCompass(ctx: CanvasRenderingContext2D, cam: Camera, look: ReturnType<typeof skyLook>) {
    const p = { x: 0, y: 0, c: 0 }
    ctx.font = '600 12px Inter, sans-serif'
    ctx.textAlign = 'center'
    const dirs: [string, number][] = [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]]
    for (const [name, az] of dirs) {
      const a = az * DEG
      const e = 1.8 * DEG
      project(cam, [Math.cos(e) * Math.cos(a), -Math.cos(e) * Math.sin(a), Math.sin(e)], p)
      if (p.c < 0.1 || p.x < 10 || p.x > this.input.w - 10 || p.y < 10 || p.y > this.input.h - 10) continue
      const main = name.length === 1
      ctx.fillStyle = main ? `rgba(255,224,160,${0.5 + 0.3 * (1 - look.daylight)})` : 'rgba(210,222,255,0.35)'
      ctx.fillText(name, p.x, p.y - 5)
    }
  }

  // ---------------------------------------------------------------------
  /** Find what is under (or near) the pointer. */
  hitTest(x: number, y: number): Hit | null {
    const inp = this.input
    if (!inp) return null
    for (const b of this.bodyPos) {
      if (Math.hypot(b.x - x, b.y - y) < Math.max(b.r, 14)) return { kind: 'body', id: b.id, x: b.x, y: b.y }
    }
    for (const o of this.dsoPos) {
      if (Math.hypot(o.x - x, o.y - y) < Math.min(Math.max(o.r * 0.55, 12), 70)) return { kind: 'dso', id: o.id, x: o.x, y: o.y }
    }
    let best = -1
    let bd = 12
    for (let n = 0; n < this.hitStarCount; n++) {
      const dd = Math.hypot(this.hitStarX[n] - x, this.hitStarY[n] - y)
      if (dd < bd) {
        bd = dd
        best = n
      }
    }
    if (best >= 0) {
      const i = this.hitStarI[best]
      return { kind: 'star', i, hip: this.catalog.stars.hip[i], x: this.hitStarX[best], y: this.hitStarY[best] }
    }
    // constellation figures: nearest stick-figure segment
    const horizonMode = inp.mode !== 'space'
    const M = this.frameMat
    const cam = this.cam
    const p = { x: 0, y: 0, c: 0 }
    let bestC: ConstellationData | null = null
    let bestD = 13
    for (const c of this.catalog.constellations) {
      for (const poly of c.lines) {
        let px = 0
        let py = 0
        let ok = false
        for (const v of poly) {
          const f = mulMat(M, v)
          project(cam, f, p)
          const vis = p.c > -0.2 && !(horizonMode && f[2] < -0.05)
          if (vis && ok) {
            const dd = segDist(x, y, px, py, p.x, p.y)
            if (dd < bestD) {
              bestD = dd
              bestC = c
            }
          }
          px = p.x
          py = p.y
          ok = vis
        }
      }
    }
    if (bestC) {
      const f = mulMat(M, bestC.centerVec)
      project(cam, f, p)
      return { kind: 'constellation', id: bestC.id, x, y }
    }
    return null
  }
}

function flagsLabel(inp: FrameInput): boolean {
  return inp.flags.labels
}

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const l2 = dx * dx + dy * dy
  let t = l2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / l2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

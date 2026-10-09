import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { twilightName } from '../astro/skyColor'
import { type Mode, simDate, useAppStore } from '../store/useAppStore'
import { skyControls, skyInfo } from '../sky/skyBus'

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'park', label: 'Park', hint: 'Stand in a quiet park and look up' },
  { id: 'sky', label: 'Open sky', hint: 'The whole screen is sky' },
  { id: 'space', label: 'Space', hint: 'Float free in space — no horizon, no ground' },
]

function useTick(ms: number) {
  const [, set] = useState(0)
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms)
    return () => clearInterval(id)
  }, [ms])
}

export function Hud() {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const lastGround = useAppStore((s) => s.lastGround)
  const place = useAppStore((s) => s.place)!
  const setScene = useAppStore((s) => s.setScene)
  const setNotebook = useAppStore((s) => s.setNotebook)
  const notebookOpen = useAppStore((s) => s.notebookOpen)
  const select = useAppStore((s) => s.select)

  return (
    <>
      <div className="hud-top">
        <div className="hud-left">
          <HudButton
            label="← World map"
            onClick={() => {
              select(null)
              setNotebook(false)
              useAppStore.getState().setSunBlocked(false)
              skyInfo.dark = 0
              setScene('map')
            }}
          />
          <AnimatePresence>
            {mode === 'space' && (
              <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
                <HudButton label="⌂ Return to Earth" onClick={() => setMode(lastGround)} accent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hud-mode" role="tablist" aria-label="View mode">
          {MODES.map((m) => (
            <button key={m.id} role="tab" aria-selected={mode === m.id} className={mode === m.id ? 'on' : ''} title={m.hint} onClick={() => setMode(m.id)}>
              {mode === m.id && <motion.span layoutId="mode-pill" className="pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="hud-right">
          <HudButton label={notebookOpen ? 'Close notebook' : '📓 Notebook'} onClick={() => setNotebook(!notebookOpen)} accent={!notebookOpen} />
        </div>
      </div>

      <PlaceChip name={place.name} tz={place.tz} lat={place.lat} lon={place.lon} />
      <BottomBar />
    </>
  )
}

function HudButton({ label, onClick, accent }: { label: string; onClick: () => void; accent?: boolean }) {
  return (
    <motion.button className={`hud-btn ${accent ? 'accent' : ''}`} whileHover={{ y: -1.5 }} whileTap={{ scale: 0.96 }} onClick={onClick}>
      {label}
    </motion.button>
  )
}

function PlaceChip({ name, tz, lat, lon }: { name: string; tz: string; lat: number; lon: number }) {
  useTick(1000)
  const offsetMs = useAppStore((s) => s.offsetMs)
  const date = simDate(offsetMs)
  const mode = useAppStore((s) => s.mode)
  const fmt = useMemo(
    () => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short' }),
    [tz],
  )
  return (
    <div className="place-chip">
      <strong>{name}</strong>
      <span>
        {Math.abs(lat).toFixed(2)}°{lat >= 0 ? 'N' : 'S'} {Math.abs(lon).toFixed(2)}°{lon >= 0 ? 'E' : 'W'}
      </span>
      <span>{fmt.format(date)}</span>
      {mode !== 'space' && <span className="twilight">{skyInfo.dark > 0.5 ? 'Sun hidden — night sky' : twilightName(skyInfo.trueSunAlt)}</span>}
    </div>
  )
}

function BottomBar() {
  const mode = useAppStore((s) => s.mode)
  const offsetMs = useAppStore((s) => s.offsetMs)
  const setOffset = useAppStore((s) => s.setOffset)
  const showLines = useAppStore((s) => s.showLines)
  const showLabels = useAppStore((s) => s.showLabels)
  const showBorders = useAppStore((s) => s.showBorders)
  const showDso = useAppStore((s) => s.showDso)
  const flags = { lines: showLines, labels: showLabels, borders: showBorders, dso: showDso }
  const toggle = useAppStore((s) => s.toggle)
  const requestReset = useAppStore((s) => s.requestReset)
  const setMode = useAppStore((s) => s.setMode)
  const lastGround = useAppStore((s) => s.lastGround)
  const [dayBase, setDayBase] = useState(0)
  const minutes = Math.round((offsetMs - dayBase) / 60000)

  const apply = (base: number, min: number) => setOffset(base + min * 60000)
  const live = offsetMs === 0

  return (
    <div className="hud-bottom">
      <div className="time-bar">
        <button className="step" title="Back one month" onClick={() => { const b = dayBase - 30 * 86400000; setDayBase(b); apply(b, minutes) }}>
          ‹‹
        </button>
        <button className="step" title="Back one day" onClick={() => { const b = dayBase - 86400000; setDayBase(b); apply(b, minutes) }}>
          ‹
        </button>
        <input
          type="range"
          min={-720}
          max={720}
          step={5}
          value={Math.max(-720, Math.min(720, minutes))}
          onChange={(e) => apply(dayBase, Number(e.target.value))}
          aria-label="Time of day offset"
        />
        <button className="step" title="Forward one day" onClick={() => { const b = dayBase + 86400000; setDayBase(b); apply(b, minutes) }}>
          ›
        </button>
        <button className="step" title="Forward one month" onClick={() => { const b = dayBase + 30 * 86400000; setDayBase(b); apply(b, minutes) }}>
          ››
        </button>
        {!live && <span className="offset">{`${offsetMs > 0 ? '+' : '−'}${fmtOffset(Math.abs(offsetMs))}`}</span>}
        <button className="now" disabled={live} title="Jump back to the present moment" onClick={() => { setDayBase(0); setOffset(0) }}>
          {live ? 'Live' : 'Now'}
        </button>
      </div>

      <div className="toggles">
        <Toggle on={flags.lines} onClick={() => toggle('showLines')} label="Figures" />
        <Toggle on={flags.labels} onClick={() => toggle('showLabels')} label="Names" />
        <Toggle on={flags.borders} onClick={() => toggle('showBorders')} label="Borders" />
        <Toggle on={flags.dso} onClick={() => toggle('showDso')} label="Deep sky" />
      </div>

      <div className="view-controls">
        <SunBlockToggle />
        <button className="round" title="Zoom out" onClick={() => skyControls.current?.zoomBy(1.35)}>
          −
        </button>
        <button className="round" title="Zoom in" onClick={() => skyControls.current?.zoomBy(1 / 1.35)}>
          +
        </button>
        <button className="pillbtn" title="Return to the default view" onClick={requestReset}>
          ⟲ {mode === 'space' ? 'Recentre on home sky' : 'Original view'}
        </button>
        {mode === 'space' && (
          <button className="pillbtn accent" onClick={() => setMode(lastGround)}>
            ⌂ Return to Earth
          </button>
        )}
      </div>
    </div>
  )
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} aria-pressed={on} onClick={onClick}>
      <i />
      {label}
    </button>
  )
}

function fmtOffset(ms: number): string {
  const m = Math.round(ms / 60000)
  const d = Math.floor(m / 1440)
  const h = Math.floor((m % 1440) / 60)
  const mm = m % 60
  return [d ? `${d} d` : '', h ? `${h} h` : '', mm ? `${mm} min` : ''].filter(Boolean).join(' ') || '0'
}

function SunBlockToggle() {
  const mode = useAppStore((s) => s.mode)
  const blocked = useAppStore((s) => s.sunBlocked)
  const style = useAppStore((s) => s.blockStyle)
  const setBlocked = useAppStore((s) => s.setSunBlocked)
  const setStyle = useAppStore((s) => s.setBlockStyle)
  useTick(500)
  if (mode === 'space') return null
  const daylight = skyInfo.trueSunAlt > -6
  const disabled = !daylight && !blocked
  return (
    <div className={`sun-toggle ${blocked ? 'on' : ''} ${disabled ? 'off' : ''}`}>
      <motion.button
        className="sun-btn"
        whileTap={{ scale: 0.95 }}
        disabled={disabled}
        title={disabled ? 'It is already dark here — the Sun is below the horizon' : 'Hide the Sun to see the stars and planets that daylight washes out'}
        onClick={() => setBlocked(!blocked)}
      >
        <span className="sun-icon" /> {blocked ? 'Bring the Sun back' : 'Block the Sun'}
      </motion.button>
      <div className="style-pick" role="radiogroup" aria-label="How to block the Sun">
        {(['paper', 'hero'] as const).map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={style === s}
            className={style === s ? 'on' : ''}
            onClick={() => {
              if (blocked) {
                setBlocked(false)
                setTimeout(() => setStyle(s), 50)
              } else setStyle(s)
            }}
            title={s === 'paper' ? 'Throw up a round paper disc' : 'Call a caped hero'}
          >
            {s === 'paper' ? 'Paper' : 'Hero'}
          </button>
        ))}
      </div>
    </div>
  )
}

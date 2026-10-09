/** A caped hero flying to the right. The round cape (.hero-cape) is scaled up by GSAP to block out the Sun. */
export function SuperHero({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 140" role="img" aria-label="The sun-blocking hero">
      <g className="hero-cape-group">
        <circle className="hero-cape" cx="92" cy="70" r="46" fill="#d63a3a" />
        <circle cx="92" cy="70" r="46" fill="none" stroke="#a52626" strokeWidth="3" />
        <path d="M92 70 L92 24 M92 70 L134 52 M92 70 L134 88 M92 70 L92 116 M92 70 L50 52 M92 70 L50 88" stroke="#a52626" strokeWidth="1.5" opacity="0.5" />
      </g>
      <g className="hero-body">
        {/* legs trailing behind */}
        <path d="M88 76 Q60 86 34 82 L36 92 Q64 98 92 90 Z" fill="#2f5bd6" />
        <path d="M30 82 L40 80 L42 94 L30 96 Z" fill="#b92a2a" />
        {/* torso */}
        <path d="M84 62 Q120 56 150 66 L148 90 Q116 100 84 88 Z" fill="#2f5bd6" />
        <path d="M96 66 L112 62 L108 84 L94 82 Z" fill="#f4c542" />
        {/* arm stretched forward */}
        <path d="M142 66 L196 60 L198 72 L144 84 Z" fill="#2f5bd6" />
        <circle cx="202" cy="66" r="9" fill="#f6d3b3" />
        {/* head */}
        <circle cx="160" cy="62" r="15" fill="#f6d3b3" />
        <path d="M146 58 Q150 42 166 46 Q176 50 174 58 Q160 52 146 58 Z" fill="#2a2326" />
        <circle cx="168" cy="63" r="1.8" fill="#2a2326" />
        <path d="M164 71 Q169 73 173 70" stroke="#a5654b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export default function TacticalFallback() {
  return (
    <div className="tactical-fallback" aria-hidden="true">
      <svg viewBox="0 0 700 700" role="presentation">
        <defs>
          <radialGradient id="reticleGlow"><stop stopColor="#ef4444" stopOpacity=".32" /><stop offset="1" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
          <linearGradient id="coreGradient" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f59e0b" /><stop offset=".48" stopColor="#ef4444" /><stop offset="1" stopColor="#441219" /></linearGradient>
        </defs>
        <circle cx="350" cy="350" r="305" fill="url(#reticleGlow)" />
        <g fill="none" stroke="#ef4444" transform="translate(350 350)">
          <circle r="240" strokeWidth="2" opacity=".42" /><circle r="202" strokeWidth="1" opacity=".26" /><circle r="145" strokeWidth="2" opacity=".55" />
          <path d="M0-284v83M0 201v83M-284 0h83M201 0h83" strokeWidth="5" opacity=".76" />
          <path d="M0-240v18M0-240v18M240 0h-18M0 240v-18M-240 0h18" strokeWidth="3" />
          {Array.from({ length: 32 }, (_, index) => <path key={index} d="M0-225v10" transform={`rotate(${index * 11.25})`} strokeWidth="2" opacity=".45" />)}
        </g>
        <path d="m350 210 112 82-43 142-138 0-43-142z" fill="url(#coreGradient)" fillOpacity=".74" stroke="#f59e0b" strokeOpacity=".7" strokeWidth="2" />
        <path d="m350 210 0 224m-112-142 224 0m-181-82 138 224m0-224L281 434" stroke="#fff" strokeOpacity=".12" strokeWidth="1" />
        <circle cx="350" cy="352" r="9" fill="#f8fafc" opacity=".85" />
      </svg>
    </div>
  );
}

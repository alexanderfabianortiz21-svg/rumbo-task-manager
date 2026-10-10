const CX = 200;
const CY = 190;
const R = 160;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

// The sun travels along the arc as tasks get completed. p is 0..1.
export default function Horizon({ p, done, total }) {
  const angle = Math.PI * p;
  const x = CX - R * Math.cos(angle);
  const y = CY - R * Math.sin(angle);

  return (
    <div className="wrap horizon">
      <svg
        viewBox="0 -10 400 200"
        role="img"
        aria-label={`${done} of ${total} tasks done`}
      >
        <defs>
          <radialGradient id="sun-core" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FFE7A8" />
            <stop offset="100%" stopColor="#F6B65B" />
          </radialGradient>
          <radialGradient id="sun-glow">
            <stop offset="0%" stopColor="#F6B65B" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F6B65B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F2776A" />
            <stop offset="100%" stopColor="#F6B65B" />
          </linearGradient>
        </defs>
        <path d={ARC} className="arc-track" />
        <path
          d={ARC}
          className="arc-trail"
          pathLength="1"
          strokeDasharray="1 1"
          strokeDashoffset={1 - p}
          opacity={p > 0.004 ? 1 : 0}
        />
        <g transform={`translate(${x} ${y})`}>
          <circle r={34 + p * 14} fill="url(#sun-glow)" />
          <circle r="13" fill="url(#sun-core)" />
        </g>
      </svg>
    </div>
  );
}

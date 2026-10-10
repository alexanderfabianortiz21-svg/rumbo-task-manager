import { useEffect, useState } from 'react';

const COLORS = ['#F6B65B', '#F2776A', '#2F9E83', '#4A90B8', '#FFFFFF'];

// Fires a short burst every time `burst` changes to a new non-zero value.
export default function Confetti({ burst }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!burst || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setPieces(
      Array.from({ length: 40 }, (_, i) => ({
        id: `${burst}-${i}`,
        x: (Math.random() - 0.5) * 560,
        y: -(140 + Math.random() * 280),
        r: Math.random() * 720 - 360,
        c: COLORS[i % COLORS.length],
        d: Math.random() * 140,
        w: 7 + Math.random() * 6,
      }))
    );
    const t = setTimeout(() => setPieces([]), 2400);
    return () => clearTimeout(t);
  }, [burst]);

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i
          key={p.id}
          style={{
            '--x': `${p.x}px`,
            '--y': `${p.y}px`,
            '--r': `${p.r}deg`,
            background: p.c,
            width: p.w,
            height: p.w * 0.5,
            animationDelay: `${p.d}ms`,
          }}
        />
      ))}
    </div>
  );
}

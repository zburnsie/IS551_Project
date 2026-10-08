import { useEffect, useId, useMemo, useRef, type CSSProperties } from 'react'

const COLORS = ['#B5532F', '#4F6B3A', '#E6B84A', '#FFFBF5', '#2A211B']

type Piece = {
  left: string
  delay: string
  duration: string
  color: string
  rotate: string
  drift: string
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.25}s`,
    duration: `${1.4 + Math.random() * 0.9}s`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    rotate: `${Math.random() * 720 - 360}deg`,
    drift: `${Math.random() * 80 - 40}px`,
  }))
}

/** Brief celebratory toast with confetti — auto-dismisses after a moment. */
export function ConfettiToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const pieces = useMemo(() => makePieces(48), [message])
  const titleId = useId()
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  useEffect(() => {
    const timer = window.setTimeout(() => onDismissRef.current(), 2200)
    return () => window.clearTimeout(timer)
  }, [message])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center overflow-hidden pt-10"
      role="status"
      aria-labelledby={titleId}
    >
      <style>{`
        @keyframes cr-confetti-fall {
          0% { transform: translate3d(0, -12px, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--drift), 100vh, 0) rotate(var(--spin)); opacity: 0; }
        }
        @keyframes cr-toast-in {
          0% { transform: translateY(-12px); opacity: 0; }
          12% { transform: translateY(0); opacity: 1; }
          75% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-8px); opacity: 0; }
        }
      `}</style>

      {pieces.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute top-0 block size-2 rounded-sm"
          style={
            {
              left: p.left,
              background: p.color,
              animation: `cr-confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
              '--drift': p.drift,
              '--spin': p.rotate,
            } as CSSProperties
          }
        />
      ))}

      <p
        id={titleId}
        className="text-body relative z-10 rounded-md border border-accent bg-surface px-4 py-3"
        style={{ animation: 'cr-toast-in 2.2s ease forwards' }}
      >
        {message}
      </p>
    </div>
  )
}

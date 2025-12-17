import { useEffect, useMemo, useState } from 'react'

export function LoadingScreen() {
  const tips = useMemo(
    () => [
      'Use W/A/S/D to walk the mall',
      'Press Space or Enter to view products',
      'Click products to add to cart',
      'Mobile: Use the joystick and tap to view',
    ],
    []
  )
  const [tipIndex, setTipIndex] = useState(0)
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 2500)
    const progTimer = setInterval(() => setProgress((p) => Math.min(92, p + Math.random() * 6)), 300)
    return () => {
      clearInterval(tipTimer)
      clearInterval(progTimer)
    }
  }, [tips.length])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '18px',
        background: 'radial-gradient(1200px 800px at 50% 40%, #0f172a 0%, #020617 60%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        overflow: 'hidden',
      }}
    >
      {/** Visual: Minimal icon animation */}
      <div
        aria-hidden
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
          boxShadow: '0 20px 60px rgba(99,102,241,0.35)',
          animation: 'floatPulse 2.2s ease-in-out infinite',
        }}
      />

      <div style={{ fontSize: 18, opacity: 0.9 }}>Preparing your mall...</div>

      {/** Visual: Premium progress bar */}
      <div style={{ width: 280, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)' }} />
      </div>

      <div style={{ fontSize: 12, opacity: 0.7 }}>{tips[tipIndex]}</div>

      <style jsx global>{`
        @keyframes floatPulse {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

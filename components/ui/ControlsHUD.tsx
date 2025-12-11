'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function ControlsHUD() {
  const getTotalItems = useStore((state) => state.getTotalItems)
  const toggleCartOverlay = useStore((state) => state.toggleCartOverlay)
  const showCartOverlay = useStore((state) => state.showCartOverlay)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q' && !showCartOverlay) {
        e.preventDefault()
        toggleCartOverlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleCartOverlay, showCartOverlay])

  return (
    <div className="hud">
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#2563eb',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: '600',
          zIndex: '50',
          cursor: 'pointer',
        }}
        onClick={toggleCartOverlay}
      >
        🛒 {getTotalItems()} items
      </div>

      <div className="controls-guide">
        <div style={{ marginBottom: '12px', fontWeight: '600', color: '#60a5fa' }}>
          KEYBOARD CONTROLS
        </div>
        <div style={{ lineHeight: '1.8', fontSize: '11px' }}>
          <div>
            <kbd>W/A/S/D</kbd> or <kbd>↑↓←→</kbd> - Move
          </div>
          <div>
            <kbd>ENTER</kbd> or <kbd>SPACE</kbd> - View Product (when near)
          </div>
          <div>
            <kbd>A</kbd> - Add to Cart (in overlay)
          </div>
          <div>
            <kbd>Q</kbd> - Open/Close Cart
          </div>
          <div>
            <kbd>ESC</kbd> - Close Overlay
          </div>
          <div style={{ marginTop: '8px', color: '#9ca3af' }}>
            <strong>MOUSE:</strong> Click products or cart icon
          </div>
        </div>
      </div>
    </div>
  )
}

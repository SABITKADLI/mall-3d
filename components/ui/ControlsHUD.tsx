'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'

export function ControlsHUD() {
  // Select data
  const cartItems = useStore((state) => state.cartItems)
  const selectedProduct = useStore((state) => state.selectedProduct)
  const showCartOverlay = useStore((state) => state.showCartOverlay)
  const showProductOverlay = useStore((state) => state.showProductOverlay)

  // Select actions
  const toggleCartOverlay = useStore((state) => state.toggleCartOverlay)
  const toggleProductOverlay = useStore((state) => state.toggleProductOverlay)

  // Hydration check
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Calculate total
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if an overlay is open
      if (showCartOverlay || showProductOverlay) return

      // 'Q' to open cart
      if (e.key.toLowerCase() === 'q') {
        e.preventDefault()
        toggleCartOverlay()
      }

      // 'Enter' or 'Space' to view product
      if (selectedProduct && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        toggleProductOverlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedProduct, showCartOverlay, showProductOverlay, toggleCartOverlay, toggleProductOverlay])

  if (!mounted) return null

  return (
    <div 
      className="hud" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', // Crucial: lets clicks pass through to the 3D game
        zIndex: 50 
      }}
    >
      {/* --- Cart Button (Top Right) --- */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#2563eb',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto', // Re-enable clicks for this button
          zIndex: 51
        }}
        onClick={(e) => {
          e.stopPropagation() // Stop click from hitting the canvas
          toggleCartOverlay()
        }}
      >
        <span style={{ fontSize: '20px' }}>🛒</span>
        <span>{totalItems}</span>
      </div>

      {/* --- Desktop Controls Guide --- */}
      <div className="controls-guide desktop-only" style={{ pointerEvents: 'none' }}>
        <div style={{ marginBottom: '12px', fontWeight: '600', color: '#60a5fa' }}>
          CONTROLS
        </div>
        <div style={{ lineHeight: '1.8', fontSize: '11px' }}>
          <div><kbd>W/A/S/D</kbd> - Move</div>
          <div><kbd>ENTER</kbd> - View Product</div>
          <div><kbd>E</kbd> - Add to Cart</div>
          <div><kbd>Q</kbd> - Cart</div>
          <div><kbd>ESC</kbd> - Close</div>
        </div>
      </div>
      
      {/* --- Mobile "View Product" Button --- */}
      {selectedProduct && (
        <button
          className="mobile-only"
          onClick={(e) => {
            e.stopPropagation()
            toggleProductOverlay()
          }}
          style={{
            position: 'fixed',
            bottom: '180px', // Positioned above the joystick area
            right: '30px',
            background: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            color: '#2563eb',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto', // Re-enable clicks
            zIndex: 51,
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <span style={{ fontSize: '20px' }}>👁️</span>
          <span>VIEW PRODUCT</span>
        </button>
      )}

      {/* Helper animation style */}
      <style jsx global>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

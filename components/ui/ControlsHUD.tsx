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
          backdropFilter: 'blur(8px)',
          background: 'rgba(37, 99, 235, 0.7)',
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: '24px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{totalItems}</span>
      </div>

      {/* --- Desktop Controls Guide --- */}
      <div className="controls-guide desktop-only" style={{ pointerEvents: 'none', position: 'fixed', bottom: '24px', left: '24px', color: '#9ca3af' }}>
        <div style={{ lineHeight: '1.8', fontSize: '12px' }}>
          <div><kbd>W/A/S/D</kbd> Move • <kbd>Q</kbd> Cart</div>
          <div><kbd>Enter</kbd>/<kbd>Space</kbd> View • Click Add to cart</div>
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
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            color: '#2563eb',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
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

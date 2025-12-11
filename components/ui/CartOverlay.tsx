'use client'

import { useGameStore } from '../providers/StoreProvider'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getCheckoutUrl } from '@/lib/shopify'

export function CartOverlay() {
  const {
    showCartOverlay,
    toggleCartOverlay,
    cartItems,
    removeFromCart,
    getTotalPrice,
    cartId,
    setIsCheckingOut,
    isCheckingOut,
  } = useGameStore()

  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      containerRef.current = document.body
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCartOverlay) {
        toggleCartOverlay()
      }
      if (e.key.toLowerCase() === 'q' && showCartOverlay) {
        handleCheckout()
      }
    }

    if (showCartOverlay) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showCartOverlay, toggleCartOverlay, cartId])

  const handleCheckout = async () => {
    if (!cartId || isCheckingOut) return

    try {
      setIsCheckingOut(true)
      const checkoutUrl = await getCheckoutUrl(cartId)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout failed:', error)
      alert('Checkout failed. Please try again.')
      setIsCheckingOut(false)
    }
  }

  // CRITICAL: Check showCartOverlay BEFORE checking containerRef
  if (!showCartOverlay) return null
  if (!containerRef.current) return null

  const content = (
    <div className="portal">
      <div className="overlay-backdrop" onClick={toggleCartOverlay} />
      <div className="overlay-content" style={{ maxWidth: '600px' }}>
        <button
          onClick={toggleCartOverlay}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 101,
          }}
        >
          ✕
        </button>

        <h2 style={{ marginBottom: '20px' }}>🛒 Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#9ca3af',
            }}
          >
            <p style={{ fontSize: '16px' }}>Your cart is empty</p>
            <p style={{ fontSize: '12px' }}>Start shopping to add items!</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0' }}>{item.title}</h4>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '12px',
                        color: '#6b7280',
                      }}
                    >
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        margin: '0 0 8px 0',
                        fontWeight: '600',
                      }}
                    >
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                paddingTop: '20px',
                borderTop: '2px solid #e5e7eb',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}
              >
                <span>Subtotal:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                <span>Total:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn-primary"
              style={{
                width: '100%',
                marginBottom: '8px',
                opacity: isCheckingOut ? 0.5 : 1,
                cursor: isCheckingOut ? 'not-allowed' : 'pointer',
              }}
            >
              {isCheckingOut ? 'Processing...' : '💳 Proceed to Checkout'}
            </button>

            <p
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                textAlign: 'center',
                marginTop: '12px',
              }}
            >
              Press <kbd>Q</kbd> to checkout or <kbd>ESC</kbd> to close
            </p>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(content, containerRef.current)
}

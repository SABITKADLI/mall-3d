'use client'

import { useGameStore } from '../providers/StoreProvider'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

export function ProductComparisonOverlay() {
  const {
    selectedProducts,
    clearSelectedProducts,
    addToCart,
  } = useGameStore()

  const containerRef = useRef<HTMLElement | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (typeof document !== 'undefined') {
      containerRef.current = document.body
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProducts.length > 0) {
        clearSelectedProducts()
      }
    }

    if (selectedProducts.length > 0) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedProducts, clearSelectedProducts])

  if (!isMounted) return null
  if (selectedProducts.length === 0 || !containerRef.current) return null

  const content = (
    <div className="portal">
      <div className="overlay-backdrop" onClick={clearSelectedProducts} />
      <div
        className="overlay-content"
        style={{
          maxWidth: selectedProducts.length > 1 ? '90vw' : '500px',
          display: 'flex',
          gap: '20px',
          padding: '20px',
          position: 'relative',
        }}
      >
        <button
          onClick={clearSelectedProducts}
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

        {selectedProducts.map((product) => (
          <div key={product.id} style={{ flex: 1, minWidth: '300px' }}>
            <Image
              src={product.image}
              alt={product.title}
              width={400}
              height={200}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '12px',
              }}
            />

            <h3 style={{ margin: '12px 0 8px 0', fontSize: '16px' }}>
              {product.title}
            </h3>

            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '12px' }}>
              {product.description.slice(0, 100)}...
            </p>

            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              ${product.price.toFixed(2)}
            </div>

            <button
              onClick={() => {
                addToCart({
                  id: product.id,
                  productId: product.id,
                  title: product.title,
                  price: product.price,
                  quantity: 1,
                  image: product.image,
                })
                alert(`✓ Added ${product.title}`)
              }}
              className="btn-primary"
              style={{ width: '100%', fontSize: '12px' }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <p
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          background: 'rgba(0,0,0,0.7)',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
        }}
      >
        Press <kbd>ESC</kbd> to close comparison
      </p>
    </div>
  )

  return createPortal(content, containerRef.current)
}

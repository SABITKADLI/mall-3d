'use client'

import { useGameStore } from '../providers/StoreProvider'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CartItem } from '../providers/StoreProvider'
import { addToCart as shopifyAddToCart, createCart } from '@/lib/shopify'

interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  price: number
  selectedOptions: Array<{
    name: string
    value: string
  }>
}

interface ProductOption {
  name: string
  values: string[]
}

export function ProductOverlay() {
  const {
    selectedProduct,
    showProductOverlay,
    toggleProductOverlay,
    addToCart,
    setCartId,
    cartId,
  } = useGameStore()

  const containerRef = useRef<HTMLElement | null>(null)
  const [adding, setAdding] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // selectedProduct is coming from your store; it now includes variants/options from shopify.ts
  const product = selectedProduct as any

  // Initialize selected variant/options when product changes
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstAvailable: ProductVariant | undefined = product.variants.find(
        (v: ProductVariant) => v.availableForSale
      )

      if (firstAvailable) {
        setSelectedVariantId(firstAvailable.id)
        const opts: Record<string, string> = {}
        firstAvailable.selectedOptions.forEach((o) => {
          opts[o.name] = o.value
        })
        setSelectedOptions(opts)
      }
    }
  }, [product])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      containerRef.current = document.body
    }
  }, [])

  const handleOptionChange = useCallback(
    (optionName: string, optionValue: string) => {
      // update local selected options
      setSelectedOptions((prev) => {
        const updated = { ...prev, [optionName]: optionValue }

        // find a variant whose selectedOptions exactly match updated options
        if (product?.variants) {
          const matching = product.variants.find((variant: ProductVariant) => {
            return (
              variant.availableForSale &&
              variant.selectedOptions.every(
                (opt) => updated[opt.name] && updated[opt.name] === opt.value
              )
            )
          })

          if (matching) {
            setSelectedVariantId(matching.id)
          } else {
            // no exact match – clear variant so Add to Cart is disabled
            setSelectedVariantId('')
          }
        }

        return updated
      })
    },
    [product]
  )

  const handleAddToCart = async () => {
    if (!product || !selectedVariantId || adding) return

    setAdding(true)
    try {
      let currentCartId = cartId

      if (!currentCartId) {
        const newCart = await createCart()
        currentCartId = newCart.id
        setCartId(newCart.id)
      }

      await shopifyAddToCart(currentCartId, [
        {
          merchandiseId: selectedVariantId,
          quantity: 1,
        },
      ])

      const variant: ProductVariant | undefined = product.variants?.find(
        (v: ProductVariant) => v.id === selectedVariantId
      )

      const cartItem: CartItem = {
        id: `${product.id}:${selectedVariantId}`,
        productId: product.id,
        title: variant ? `${product.title} - ${variant.title}` : product.title,
        price: variant ? variant.price : product.price,
        quantity: 1,
        image: product.image,
      }

      addToCart(cartItem)

      alert('✓ Added to cart!')
      toggleProductOverlay()
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add item to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!showProductOverlay) return

      if (e.key === 'Escape') {
        toggleProductOverlay()
      }

      if (e.key.toLowerCase() === 'a' && selectedVariantId && !adding) {
        e.preventDefault()
        await handleAddToCart()
      }
    },
    [showProductOverlay, toggleProductOverlay, selectedVariantId, adding]
  )

  useEffect(() => {
    if (showProductOverlay) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showProductOverlay, handleKeyDown])

  if (!showProductOverlay || !product) return null
  if (!containerRef.current) return null

  const hasVariants = product.variants && product.variants.length > 1
  const currentVariant: ProductVariant | undefined = product.variants?.find(
    (v: ProductVariant) => v.id === selectedVariantId
  )
  const currentPrice = currentVariant?.price ?? product.price

  const content = (
    <div className="portal">
      <div className="overlay-backdrop" onClick={toggleProductOverlay} />
      <div className="overlay-content">
        <button
          onClick={toggleProductOverlay}
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

        <img
          src={product.image}
          alt={product.title}
          style={{
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        />

        <h2 style={{ margin: '16px 0 8px 0' }}>{product.title}</h2>

        {hasVariants && (
          <div
            style={{
              marginBottom: '12px',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: '#374151',
              }}
            >
              Select options:
            </div>

            {product.options?.map((option: ProductOption, optionIndex: number) => (
              <div key={optionIndex} style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    marginBottom: '4px',
                    color: '#6b7280',
                  }}
                >
                  {option.name}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {option.values.map((value, valueIndex) => {
                    const isSelected = selectedOptions[option.name] === value

                    // disable values that never appear on any available variant
                    const isDisabled =
                      !product.variants?.some((v: ProductVariant) =>
                        v.availableForSale &&
                        v.selectedOptions.some(
                          (o) => o.name === option.name && o.value === value
                        )
                      )

                    return (
                      <button
                        key={valueIndex}
                        type="button"
                        onClick={() => handleOptionChange(option.name, value)}
                        disabled={isDisabled}
                        style={{
                          padding: '6px 12px',
                          border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                          borderRadius: '20px',
                          background: isSelected ? '#eff6ff' : '#f9fafb',
                          color: isDisabled ? '#9ca3af' : '#374151',
                          fontSize: '12px',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div style={{ fontSize: '12px', color: '#059669', marginTop: '8px' }}>
              Selected: {currentVariant?.title || 'No valid combination yet'}
            </div>
          </div>
        )}

        <p
          style={{
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '16px',
            lineHeight: '1.5',
          }}
        >
          {product.description}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            ${currentPrice.toFixed(2)}
          </span>
          <span
            style={{
              backgroundColor: '#e5e7eb',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
            }}
          >
            {product.collectionHandle}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!selectedVariantId || adding}
          className="btn-primary"
          style={{
            width: '100%',
            marginBottom: '8px',
            opacity: !selectedVariantId ? 0.5 : 1,
            cursor: !selectedVariantId ? 'not-allowed' : 'pointer',
          }}
        >
          {adding ? 'Adding...' : '🛒 Add to Cart'}
        </button>

        <p
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            textAlign: 'center',
            marginTop: '12px',
          }}
        >
          Press <kbd>A</kbd> to add to cart • <kbd>ESC</kbd> to close
        </p>
      </div>
    </div>
  )

  return createPortal(content, containerRef.current)
}

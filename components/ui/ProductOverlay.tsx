'use client'

import { useGameStore } from '../providers/StoreProvider'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
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
  image?: {
    src: string
    altText?: string
  }
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

  const product = selectedProduct as {
    id: string
    title: string
    description: string
    image: string
    price: number
    collectionHandle: string
    variants?: ProductVariant[]
    options?: ProductOption[]
  }

  // mount portal target
  useEffect(() => {
    if (typeof document !== 'undefined') {
      containerRef.current = document.body
    }
  }, [])

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

  const handleOptionChange = useCallback(
    (optionName: string, optionValue: string) => {
      setSelectedOptions((prev) => {
        const updated = { ...prev, [optionName]: optionValue }

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
            setSelectedVariantId('')
          }
        }

        return updated
      })
    },
    [product]
  )

  const handleAddToCart = useCallback(async () => {
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
        image: variant?.image?.src || product.image,
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
  }, [
    product,
    selectedVariantId,
    adding,
    cartId,
    setCartId,
    addToCart,
    toggleProductOverlay,
  ])

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!showProductOverlay) return

      if (e.key === 'Escape') {
        toggleProductOverlay()
      }

      if (e.key.toLowerCase() === 'e' && selectedVariantId && !adding) {
        e.preventDefault()
        await handleAddToCart()
      }
    },
    [showProductOverlay, toggleProductOverlay, selectedVariantId, adding, handleAddToCart]
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

  const currentImageSrc: string = currentVariant?.image?.src || product.image
  const currentImageAlt: string =
    currentVariant?.image?.altText || currentVariant?.title || product.title

  const content = (
    <div className="portal">
      <div className="overlay-backdrop" onClick={toggleProductOverlay} />
      <div className="overlay-content enhanced-product-overlay">
        <button
          onClick={toggleProductOverlay}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '999px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: 101,
            boxShadow: '0 4px 8px rgba(15, 23, 42, 0.25)',
          }}
        >
          ✕
        </button>

        <div className="overlay-grid">
          {/* LEFT: Image */}
          <div className="overlay-left">
            <Image
              src={currentImageSrc}
              alt={currentImageAlt}
              width={320}
              height={320}
              style={{
                width: '100%',
                height: '320px',
                objectFit: 'cover',
                borderRadius: '12px',
                marginBottom: '12px',
              }}
            />
          </div>

          {/* RIGHT: Info + options */}
          <div className="overlay-right">
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', lineHeight: 1.2 }}>
              {product.title}
            </h2>

            <div
              style={{
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '8px',
              }}
            >
              {product.collectionHandle}
            </div>

            {hasVariants && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#111827',
                  }}
                >
                  Select options
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
                              borderRadius: '999px',
                              background: isSelected ? '#eff6ff' : '#f9fafb',
                              color: isDisabled ? '#9ca3af' : '#111827',
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

                <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                  Selected: {currentVariant?.title || 'No valid combination yet'}
                </div>
              </div>
            )}

            <p
              style={{
                color: '#4b5563',
                fontSize: '14px',
                marginBottom: '16px',
                lineHeight: 1.5,
                maxHeight: '350px',
                overflowY: 'auto',
              }}
            >
              {product.description}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '26px', fontWeight: 700 }}>
                ${currentPrice.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#10b981',
                  fontWeight: 500,
                }}
              >
                In stock
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
                marginTop: '8px',
              }}
            >
              Press <kbd>E</kbd> to add to cart • <kbd>ESC</kbd> to close
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .overlay-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
        }
        .overlay-content {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          max-height: none;
          overflow: auto;
          z-index: 101;
          width: 90vw;
          max-width: 1000px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
        }
        .overlay-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .overlay-left,
        .overlay-right {
          width: 100%;
        }

        @media (min-width: 768px) {
          .overlay-grid {
            flex-direction: row;
            align-items: flex-start;
          }
          .overlay-left {
            width: 50%;
          }
          .overlay-right {
            width: 50%;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(content, containerRef.current)
}

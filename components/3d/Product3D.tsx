'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Group } from 'three'
import { useStore } from '@/lib/store'
import { Product } from '@/lib/types'
import { Text, useTexture } from '@react-three/drei'

interface Product3DProps {
  product: Product
  isNearby: boolean
  index: number
}

export function Product3D({ product, isNearby, index }: Product3DProps) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const [popping, setPopping] = useState(false)
  const [scaleTarget, setScaleTarget] = useState(1)
  const setSelectedProduct = useStore((state) => state.setSelectedProduct)
  const toggleProductOverlay = useStore((state) => state.toggleProductOverlay)
  const showProductOverlay = useStore((state) => state.showProductOverlay)
  const texture = useTexture(product.image)

  // Only the first nearby product (index 0) can be activated with keyboard
  const isFocused = isNearby && index === 0

  useEffect(() => {
    if (!isFocused || showProductOverlay) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        console.log('⌨️ KEYBOARD: Opening product:', product.title)
        setSelectedProduct(product)
        toggleProductOverlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFocused, product, setSelectedProduct, toggleProductOverlay, showProductOverlay])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
      if (hovered || isFocused) {
        groupRef.current.position.y = 1.3
      } else {
        groupRef.current.position.y = 1
      }

      // Click pop animation
      const currentScale = groupRef.current.scale.x
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      const next = lerp(currentScale, scaleTarget, 0.15)
      groupRef.current.scale.set(next, next, next)
      if (Math.abs(next - scaleTarget) < 0.001 && popping) {
        setScaleTarget(1)
        setPopping(false)
      }
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    console.log('🖱️ MOUSE: Product clicked:', product.title)
    setPopping(true)
    setScaleTarget(1.06)
    setSelectedProduct(product)
    toggleProductOverlay()
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'default'
  }

  const isActive = hovered || isFocused

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/** Visual: Product card with image and subtle rim */}
      <group>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.2, 0.08]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.6} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[0.76, 1.16]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>

        {/** Visual: Soft outline when active */}
        {isActive && (
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[0.82, 1.22]} />
            <meshBasicMaterial color={'#93c5fd'} transparent opacity={0.4} />
          </mesh>
        )}
      </group>

      {/** Visual: Floating label with name and price when active */}
      {isActive && (
        <group position={[0, 1.6, 0]}>
          <Text fontSize={0.28} color="#111827" anchorX="center" anchorY="middle">
            {product.title} • ${product.price.toFixed(2)}
          </Text>
        </group>
      )}

      {/** Visual: Context hint when focused */}
      {isFocused && (
        <group position={[0, -1.1, 0]}>
          <Text fontSize={0.18} color="#2563eb" anchorX="center" anchorY="top">
            Press Space or Enter to view • Click to add to cart
          </Text>
        </group>
      )}
    </group>
  )
}

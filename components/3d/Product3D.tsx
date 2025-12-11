'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { useStore } from '@/lib/store'
import { Product } from '@/lib/types'

interface Product3DProps {
  product: Product
  isNearby: boolean
  index: number
}

export function Product3D({ product, isNearby, index }: Product3DProps) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const setSelectedProduct = useStore((state) => state.setSelectedProduct)
  const toggleProductOverlay = useStore((state) => state.toggleProductOverlay)
  const showProductOverlay = useStore((state) => state.showProductOverlay)

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
      groupRef.current.rotation.y += 0.01
      if (hovered || isFocused) {
        groupRef.current.position.y = 1.3
      } else {
        groupRef.current.position.y = 1
      }
    }
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    console.log('🖱️ MOUSE: Product clicked:', product.title)
    setSelectedProduct(product)
    toggleProductOverlay()
  }

  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e: any) => {
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
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial 
          color={isActive ? '#00ff00' : '#ffff00'} 
          emissive={isActive ? '#00ff00' : '#ffaa00'}
          emissiveIntensity={isActive ? 0.5 : 0.3}
        />
      </mesh>

      <mesh position={[0, -0.7, 0.3]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {isActive && (
        <group position={[0, 1.8, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.6]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.9, 0.5]} />
            <meshBasicMaterial color={isFocused ? '#00ff00' : '#ffff00'} />
          </mesh>
        </group>
      )}

      {isFocused && (
        <group position={[0, -1.2, 0]}>
          <mesh>
            <planeGeometry args={[1.8, 0.4]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </group>
      )}
    </group>
  )
}

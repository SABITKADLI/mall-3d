'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { Player } from './Player'
import { FollowCamera } from './FollowCamera'
import { MallLayout } from './MallLayout'
import { Lighting } from './Lighting'
import { Environment } from './Environment'
import { ProductOverlay } from '../ui/ProductOverlay'
import { ProductComparisonOverlay } from '../ui/ProductComparisonOverlay'
import { CartOverlay } from '../ui/CartOverlay'
import { ControlsHUD } from '../ui/ControlsHUD'
import { useStore } from '@/lib/store'

export function Scene() {
  const setCartId = useStore((state) => state.setCartId)

  useEffect(() => {
    const initCart = async () => {
      try {
        // Initialize cart logic here if needed
      } catch (error) {
        console.error('Failed to initialize cart:', error)
      }
    }

    initCart()
  }, [setCartId])

  return (
    <>
      <Canvas
        camera={{ position: [0, 8, 10], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        shadows
      >
        <Suspense fallback={null}>
          <Lighting />
          <Environment />
          <MallLayout />
          <Player />
          <FollowCamera />
        </Suspense>
      </Canvas>

      <ControlsHUD />
      <ProductOverlay />
      <ProductComparisonOverlay />
      <CartOverlay />
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Aisle } from './Aisle'
import type { AisleConfig } from '@/lib/types'
import { getCollections } from '@/lib/shopify'
import { useStore } from '@/lib/store'

/**
 * Dynamic mall dimensions that expand based on number of collections
 * No artificial limits - mall grows infinitely with collections
 */
export function calculateMallDimensions(numAisles: number) {
  const AISLE_SPACING = 10
  const BASE_WIDTH = 40
  const BASE_WALL_HEIGHT = 4
  const WALL_THICKNESS = 0.5

  // Calculate depth based on number of aisles
  const requiredDepth = Math.max(80, numAisles * AISLE_SPACING + 20)

  return {
    floorWidth: BASE_WIDTH,
    floorDepth: requiredDepth,
    wallThickness: WALL_THICKNESS,
    wallHeight: BASE_WALL_HEIGHT,
    bounds: {
      minX: -(BASE_WIDTH / 2) + WALL_THICKNESS + 1,
      maxX: BASE_WIDTH / 2 - WALL_THICKNESS - 1,
      minZ: -(requiredDepth / 2) + WALL_THICKNESS + 1,
      maxZ: requiredDepth / 2 - WALL_THICKNESS - 1,
    },
  }
}

export const MALL_DIMENSIONS = calculateMallDimensions(6)

export function MallLayout() {
  const [aisles, setAisles] = useState<AisleConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [mallDimensions, setMallDimensions] = useState(MALL_DIMENSIONS)
  
  // Get setMallBounds from store
  const setMallBounds = useStore((state) => state.setMallBounds)

  useEffect(() => {
    const loadCollections = async () => {
      try {
        console.log('🔄 Fetching ALL collections from Shopify (no limits)...')
        const collections = await getCollections()
        console.log('✅ Collections received:', collections)

        if (collections.length === 0) {
          console.warn('⚠️ No collections with products found.')
          setLoading(false)
          return
        }

        console.log(`🏪 Found ${collections.length} collections with products`)

        // Calculate dynamic mall dimensions based on actual collection count
        const dynamicDimensions = calculateMallDimensions(collections.length)
        setMallDimensions(dynamicDimensions)
        
        // Update bounds in store so Player can use them
        setMallBounds(dynamicDimensions.bounds)
        
        console.log(`📐 Mall dimensions calculated:`, dynamicDimensions)
        console.log(`🚶 Player bounds updated in store:`, dynamicDimensions.bounds)

        // Generate aisles - centered layout
        const spacing = 10
        const offset = Math.floor(collections.length / 2)

        const generated: AisleConfig[] = collections.map((col, index) => {
          const z = (index - offset) * spacing

          return {
            id: col.id,
            collectionHandle: col.handle,
            position: { x: 0, z },
            rotation: 0,
            label: col.title,
            bounds: {
              minX: -12,
              maxX: 12,
              minZ: z - 3,
              maxZ: z + 3,
            },
          }
        })

        console.log(`✅ Generated ${generated.length} aisles`)
        setAisles(generated)
      } catch (error) {
        console.error('❌ Failed to load collections:', error)
        setAisles([])
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [setMallBounds])

  const { floorWidth, floorDepth, wallThickness, wallHeight } = mallDimensions
  const halfWidth = floorWidth / 2
  const halfDepth = floorDepth / 2

  return (
    <>
      {/* Floor - dynamically sized */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[floorWidth, floorDepth]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Walls - dynamically positioned based on mall size */}
      <WallSegment 
        position={[-halfWidth, wallHeight / 2, 0]} 
        args={[wallThickness, wallHeight, floorDepth]} 
      />
      <WallSegment 
        position={[halfWidth, wallHeight / 2, 0]} 
        args={[wallThickness, wallHeight, floorDepth]} 
      />
      <WallSegment 
        position={[0, wallHeight / 2, -halfDepth]} 
        args={[floorWidth, wallHeight, wallThickness]} 
      />
      <WallSegment 
        position={[0, wallHeight / 2, halfDepth]} 
        args={[floorWidth, wallHeight, wallThickness]} 
      />

      {/* Loading indicator */}
      {loading && (
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Dynamic aisles - ALL collections with products */}
      {aisles.map((aisle) => (
        <Aisle key={aisle.id} config={aisle} />
      ))}

      {/* No products message */}
      {!loading && aisles.length === 0 && (
        <group position={[0, 2, 0]}>
          <mesh>
            <boxGeometry args={[8, 3, 0.5]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      )}
    </>
  )
}

function WallSegment({
  position,
  args,
}: {
  position: [number, number, number]
  args: [number, number, number]
}) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#d1d5db" />
    </mesh>
  )
}

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

// Entrance at 10 units in front of player (at origin)
const ENTRANCE_Z = 10
// Aisles start right at entrance
const MALL_START_Z = ENTRANCE_Z

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

        // Generate aisles - START AT ENTRANCE, go deeper into mall
        const spacing = 10

        const generated: AisleConfig[] = collections.map((col, index) => {
          // Start at entrance and go forward (positive Z)
          const z = MALL_START_Z + 20 + index * spacing

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

  return (
    <>
      {/* Visual: Polished tile floor with soft reflections */}
      <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorWidth, 500, 40, 80]} />
        <meshPhysicalMaterial
          color="#f5f5f7"
          roughness={0.2}
          metalness={0.05}
          clearcoat={0.8}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Visual: Subtle tile seams */}
      <gridHelper args={[500, 40, '#e9eaee', '#e9eaee']} position={[0, 0.001, 100]} />

      {/* Visual: Guidance LED strip along main path */}
      <group position={[0, 0.02, 0]}>
        {Array.from({ length: 40 }).map((_, i) => (
          <mesh key={`guide-${i}`} position={[0, 0, -80 + i * 10]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.4, 0.12]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.25} />
          </mesh>
        ))}
      </group>

      {/* Walls - extending far to accommodate many aisles */}
      <WallSegment
        position={[-halfWidth, wallHeight / 2, 100]}
        args={[wallThickness, wallHeight, 500]}
      />
      <WallSegment
        position={[halfWidth, wallHeight / 2, 100]}
        args={[wallThickness, wallHeight, 500]}
      />
      <WallSegment
        position={[0, wallHeight / 2, -50]}
        args={[floorWidth, wallHeight, wallThickness]}
      />
      <WallSegment
        position={[0, wallHeight / 2, 300]}
        args={[floorWidth, wallHeight, wallThickness]}
      />

      {/* ==================== ENTRANCE AREA (10 units ahead) ==================== */}
      {/* Entrance floor marker - bright orange color */}
      <mesh position={[0, 0.02, ENTRANCE_Z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[22, 8]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#f97316"
          emissiveIntensity={0.3}
          roughness={0.6}
        />
      </mesh>

      {/* Entrance arch frame - 5 steps up */}
      <group position={[0, 0, ENTRANCE_Z]}>
        {/* Bottom step foundation */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 0.5, 1.5]} />
          <meshStandardMaterial
            color="#0f766e"
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>

        {/* Steps up to arch */}
        {[0, 1, 2, 3, 4].map((step) => (
          <mesh
            key={`step-${step}`}
            position={[0, 0.8 + step * 0.4, 0.5 + step * 0.2]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[20 - step * 1.5, 0.4, 1]} />
            <meshStandardMaterial
              color="#0f766e"
              emissive="#0f766e"
              emissiveIntensity={0.1}
              roughness={0.5}
              metalness={0.1}
            />
          </mesh>
        ))}

        {/* Top arch bar */}
        <mesh position={[0, 2.8, 1.4]} castShadow receiveShadow>
          <boxGeometry args={[18, 0.5, 0.5]} />
          <meshStandardMaterial
            color="#0f766e"
            emissive="#0f766e"
            emissiveIntensity={0.25}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>

        {/* Left pillar */}
        <mesh position={[-9, 1.5, 1.2]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 3.5, 0.5]} />
          <meshStandardMaterial
            color="#0f766e"
            emissive="#0f766e"
            emissiveIntensity={0.25}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>

        {/* Right pillar */}
        <mesh position={[9, 1.5, 1.2]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 3.5, 0.5]} />
          <meshStandardMaterial
            color="#0f766e"
            emissive="#0f766e"
            emissiveIntensity={0.25}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>

        {/* Welcome sign on top */}
        <mesh position={[0, 3.2, 1.6]} castShadow receiveShadow>
          <boxGeometry args={[16, 1, 0.2]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Accent light strip */}
        <mesh position={[0, 3, 1.7]}>
          <boxGeometry args={[18, 0.15, 0.1]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#f97316"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Entrance directional lighting */}
      <pointLight position={[0, 4, ENTRANCE_Z]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-8, 2.5, ENTRANCE_Z]} intensity={0.8} color="#f97316" />
      <pointLight position={[8, 2.5, ENTRANCE_Z]} intensity={0.8} color="#f97316" />

      {/* Loading indicator with soft glow */}
      {loading && (
        <group position={[0, 1, 30]}>
          <mesh castShadow>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
              color="#facc15"
              emissive="#facc15"
              emissiveIntensity={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.6, 32]} />
            <meshBasicMaterial color="#facc15" transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* Dynamic aisles - START AT ENTRANCE, go deeper */}
      {aisles.map((aisle) => (
        <Aisle key={aisle.id} config={aisle} />
      ))}

      {/* No products message */}
      {!loading && aisles.length === 0 && (
        <group position={[0, 2, 30]}>
          <mesh castShadow receiveShadow>
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
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshPhysicalMaterial color="#e7e7ea" roughness={0.85} metalness={0.02} />
    </mesh>
  )
}

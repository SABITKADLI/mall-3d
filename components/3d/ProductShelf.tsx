'use client'

import { useRef, useState } from 'react'
import { Group, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { Product3D } from './Product3D'
import { Product } from '@/lib/types'
import { useStore } from '@/lib/store'

interface ProductShelfProps {
  products: Product[]
  position: [number, number, number]
}

export function ProductShelf({ products, position }: ProductShelfProps) {
  const groupRef = useRef<Group>(null)
  const playerPos = useStore((state) => state.playerPos)
  const [isNearby, setIsNearby] = useState(false)

  useFrame(() => {
    if (!groupRef.current) return

    const worldPos = new Vector3()
    groupRef.current.getWorldPosition(worldPos)

    const playerWorldPos = new Vector3(playerPos.x, 0, playerPos.z)
    const distance = worldPos.distanceTo(playerWorldPos)

    setIsNearby(distance < 4)
  })

  return (
    <group ref={groupRef} position={position}>
      {/** Visual: Premium shelf with metal base and lit platforms */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 0.25, 1.6]} />
        <meshPhysicalMaterial color="#9aa1a9" roughness={0.6} metalness={0.4} />
      </mesh>

      {/** Visual: Subtle glass lip */}
      <mesh position={[0, 0.7, 0.78]} castShadow>
        <boxGeometry args={[6.3, 0.05, 0.04]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.75} thickness={0.02} roughness={0.1} />
      </mesh>

      {/** Better spacing and lit pedestals */}
      {products.map((product, idx) => {
        const offsetX = (idx - products.length / 2 + 0.5) * 2.2
        return (
          <group key={product.id} position={[offsetX, 1, 0]}>
            <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.35, 0.48, 32]} />
              <meshStandardMaterial color={isNearby && idx === 0 ? '#93c5fd' : '#e5e7eb'} emissive={isNearby && idx === 0 ? '#93c5fd' : '#000000'} emissiveIntensity={isNearby && idx === 0 ? 0.6 : 0} />
            </mesh>
            <Product3D product={product} isNearby={isNearby} index={idx} />
          </group>
        )
      })}
    </group>
  )
}

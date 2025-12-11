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
      {/* Wider shelf */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 0.2, 1.5]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>

      {/* Better spacing between products: 2 units apart */}
      {products.map((product, idx) => {
        const offsetX = (idx - products.length / 2 + 0.5) * 2
        return (
          <group key={product.id} position={[offsetX, 1, 0]}>
            <Product3D product={product} isNearby={isNearby} index={idx} />
          </group>
        )
      })}
    </group>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Group } from 'three'
import { useRef } from 'react'
import { Text } from '@react-three/drei'
import { ProductShelf } from './ProductShelf'
import { AisleConfig } from '@/lib/types'
import { Product } from '@/lib/types'
import { getProductsByCollection } from '@/lib/shopify'

interface AisleProps {
  config: AisleConfig
}

export function Aisle({ config }: AisleProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const groupRef = useRef<Group>(null)

  console.log(`🏷️ Rendering aisle: ${config.label}`)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log(`🛒 Fetching products for collection: ${config.collectionHandle}`)
        const data = await getProductsByCollection(config.collectionHandle)
        setProducts(data)
      } catch (error) {
        console.error(`❌ Failed to fetch products:`, error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [config.collectionHandle])

  return (
    <group ref={groupRef} position={[config.position.x, 0, config.position.z]}>
      {/* Visual: Aisle floor marker with soft matte tone */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 4]} />
        <meshPhysicalMaterial color="#f4f5f7" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Visual: Glass storefront panel with metal frame */}
      <group position={[0, 3.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[16.4, 1.2, 0.08]} />
          <meshPhysicalMaterial color="#9aa1a9" roughness={0.7} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[16, 0.9, 0.02]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.8} thickness={0.08} roughness={0.15} />
        </mesh>
      </group>

      {/* Visual: Premium signage */}
      <Text
        position={[0, 3.5, 0.3]}
        fontSize={0.6}
        color="#111827"
        anchorX="center"
        anchorY="middle"
        maxWidth={14}
      >
        {config.label}
      </Text>

      {/* Loading indicator */}
      {loading && (
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ff6b00" />
        </mesh>
      )}

      {/* Shelves with products */}
      {!loading && products.length > 0 && (
        <>
          <ProductShelf products={products.slice(0, 2)} position={[-8, 0, 0]} />
          <ProductShelf products={products.slice(2, 4)} position={[0, 0, 0]} />
          <ProductShelf products={products.slice(4, 6)} position={[8, 0, 0]} />
        </>
      )}

      {/* No products indicator */}
      {!loading && products.length === 0 && (
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.5, 0.5]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  )
}

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { useRef } from 'react'
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log(`🛒 Fetching products for collection: ${config.collectionHandle}`)
        const data = await getProductsByCollection(config.collectionHandle)
        console.log(`📦 Products for ${config.collectionHandle}:`, data)
        setProducts(data)
      } catch (error) {
        console.error(`❌ Failed to fetch products for ${config.collectionHandle}:`, error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [config.collectionHandle])

  return (
    <group ref={groupRef} position={[config.position.x, 0, config.position.z]}>
      {/* Aisle floor marker */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>

      {/* Label */}
      <Label text={config.label} position={[0, 2, 0]} />

      {/* Loading indicator */}
      {loading && (
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ff6b00" emissive="#ff6b00" emissiveIntensity={0.5} />
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
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2, 0.5, 0.5]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  )
}

function Label({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[4, 0.5]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
    </group>
  )
}

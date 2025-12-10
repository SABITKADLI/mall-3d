'use client'

import { useState, useEffect } from 'react'

export interface Department {
  id: string
  name: string
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  color: string
  products: string[] // Shopify product handles
}

export const departments: Department[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    bounds: { minX: -10, maxX: -4, minZ: -3, maxZ: 3 },
    color: '#4a90e2',
    products: [] // Add your Shopify product handles here
  },
  {
    id: 'home',
    name: 'Home & Living',
    bounds: { minX: -2, maxX: 4, minZ: -3, maxZ: 3 },
    color: '#e27d60',
    products: [] // Add your Shopify product handles here
  },
  {
    id: 'fashion',
    name: 'Fashion',
    bounds: { minX: 6, maxX: 12, minZ: -3, maxZ: 3 },
    color: '#85c285',
    products: [] // Add your Shopify product handles here
  }
]

export function useDepartmentDetection(playerPosition: { x: number; z: number }) {
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)

  useEffect(() => {
    const dept = departments.find(d =>
      playerPosition.x >= d.bounds.minX &&
      playerPosition.x <= d.bounds.maxX &&
      playerPosition.z >= d.bounds.minZ &&
      playerPosition.z <= d.bounds.maxZ
    )
    setCurrentDepartment(dept || null)
  }, [playerPosition.x, playerPosition.z])

  return currentDepartment
}

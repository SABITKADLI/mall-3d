'use client'

import { useState, useEffect } from 'react'
import { Department } from './DepartmentManager'

interface ProductOverlayProps {
  department: Department | null
}

// Mock product data - replace with real Shopify data
const mockProducts = [
  {
    id: '1',
    title: 'Sample Product 1',
    price: '29.99',
    image: 'https://via.placeholder.com/200'
  },
  {
    id: '2',
    title: 'Sample Product 2',
    price: '39.99',
    image: 'https://via.placeholder.com/200'
  }
]

export default function ProductOverlay({ department }: ProductOverlayProps) {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (department) {
      // TODO: Replace with real Shopify API call
      setProducts(mockProducts)
    } else {
      setProducts([])
    }
  }, [department])

  if (!department) return null

  return (
    <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-800">{department.name}</h2>
        <div 
          className="w-6 h-6 rounded-full" 
          style={{ backgroundColor: department.color }}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h3 className="font-semibold text-sm mb-1">{product.title}</h3>
            <p className="text-lg font-bold text-green-600 mb-2">
              ${product.price}
            </p>
            <button
              onClick={() => alert('Add to cart clicked for: ' + product.title)}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

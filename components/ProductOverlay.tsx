'use client'

import { useState, useEffect } from 'react'
import { getProductsByHandles, addToCart } from '@/lib/shopify'

interface ProductOverlayProps {
  department: { name: string; products: string[] } | null
}

export default function ProductOverlay({ department }: ProductOverlayProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (department) {
      setLoading(true)
      getProductsByHandles(department.products).then(data => {
        setProducts(data.data.products.edges.map((e: any) => e.node))
        setLoading(false)
      })
    } else {
      setProducts([])
    }
  }, [department])

  if (!department) return null

  return (
    <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{department.name}</h2>
      
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg p-4">
              {product.images.edges[0] && (
                <img 
                  src={product.images.edges[0].node.url} 
                  alt={product.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold">{product.title}</h3>
              <p className="text-lg font-bold text-green-600">
                ${product.priceRange.minVariantPrice.amount}
              </p>
              <button
                onClick={() => addToCart(product.variants.edges[0].node.id)}
                className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

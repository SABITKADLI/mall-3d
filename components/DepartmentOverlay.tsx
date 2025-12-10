'use client'

import { Department } from '@/data/departments'

interface DepartmentOverlayProps {
  department: Department | null
}

export default function DepartmentOverlay({ department }: DepartmentOverlayProps) {
  if (!department) return null

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md w-96">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{department.name}</h2>
        <p className="text-sm text-gray-500">Browse our collection</p>
      </div>

      <div className="space-y-3">
        {department.products.map((product, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{product.title}</h3>
              <p className="text-lg font-bold text-blue-600">{product.price}</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

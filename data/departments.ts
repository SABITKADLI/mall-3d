export interface Department {
  id: string
  name: string
  color: string
  position: { x: number; y: number; z: number }
  size: { width: number; height: number; depth: number }
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  products: Array<{
    title: string
    price: string
    image: string
    handle: string
  }>
}

export const departments: Department[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    color: '#4a90e2',
    position: { x: -8, y: 1, z: -5 },
    size: { width: 4, height: 2, depth: 4 },
    bounds: { minX: -10, maxX: -6, minZ: -7, maxZ: -3 },
    products: [
      {
        title: 'Wireless Headphones',
        price: '$89.99',
        image: '/placeholder-product.jpg',
        handle: 'wireless-headphones'
      },
      {
        title: 'Smart Watch',
        price: '$249.99',
        image: '/placeholder-product.jpg',
        handle: 'smart-watch'
      },
      {
        title: 'Bluetooth Speaker',
        price: '$59.99',
        image: '/placeholder-product.jpg',
        handle: 'bluetooth-speaker'
      }
    ]
  },
  {
    id: 'home',
    name: 'Home & Living',
    color: '#e27d60',
    position: { x: 8, y: 1, z: -5 },
    size: { width: 4, height: 2, depth: 4 },
    bounds: { minX: 6, maxX: 10, minZ: -7, maxZ: -3 },
    products: [
      {
        title: 'Throw Pillows Set',
        price: '$39.99',
        image: '/placeholder-product.jpg',
        handle: 'throw-pillows'
      },
      {
        title: 'Scented Candles',
        price: '$24.99',
        image: '/placeholder-product.jpg',
        handle: 'scented-candles'
      },
      {
        title: 'Wall Art Print',
        price: '$49.99',
        image: '/placeholder-product.jpg',
        handle: 'wall-art'
      }
    ]
  },
  {
    id: 'fashion',
    name: 'Fashion',
    color: '#85e2a6',
    position: { x: 0, y: 1, z: -12 },
    size: { width: 4, height: 2, depth: 4 },
    bounds: { minX: -2, maxX: 2, minZ: -14, maxZ: -10 },
    products: [
      {
        title: 'Summer Dress',
        price: '$69.99',
        image: '/placeholder-product.jpg',
        handle: 'summer-dress'
      },
      {
        title: 'Leather Jacket',
        price: '$199.99',
        image: '/placeholder-product.jpg',
        handle: 'leather-jacket'
      },
      {
        title: 'Sneakers',
        price: '$89.99',
        image: '/placeholder-product.jpg',
        handle: 'sneakers'
      }
    ]
  }
]

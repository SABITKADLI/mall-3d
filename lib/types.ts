export interface Product {
  id: string
  title: string
  handle: string
  description: string
  price: number
  image: string
  collectionHandle: string
}

export interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  quantity: number
  image: string
}

export interface Cart {
  id: string
  checkoutUrl: string
  items: CartItem[]
  subtotal: number
  total: number
}

export interface AisleConfig {
  id: string
  collectionHandle: string
  position: { x: number; z: number }
  rotation: number
  label: string
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
  }
}

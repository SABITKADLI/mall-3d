import { create } from 'zustand'
import type { CartItem, Product } from '@/components/providers/StoreProvider'

export interface GameStore {
  // Player state
  playerPos: { x: number; z: number }
  playerRot: number

  // Mall bounds (dynamic)
  mallBounds: { minX: number; maxX: number; minZ: number; maxZ: number } | null

  // Cart state
  cartId: string | null
  cartItems: CartItem[]

  // UI state
  selectedProduct: Product | null
  selectedProducts: Product[]
  showProductOverlay: boolean
  showCartOverlay: boolean
  isCheckingOut: boolean

  // Actions
  setPlayerPos: (pos: { x: number; z: number }) => void
  setPlayerRot: (rot: number) => void
  setMallBounds: (bounds: { minX: number; maxX: number; minZ: number; maxZ: number }) => void
  setSelectedProduct: (product: Product | null) => void
  addSelectedProduct: (product: Product) => void
  removeSelectedProduct: (productId: string) => void
  clearSelectedProducts: () => void
  toggleProductOverlay: () => void
  toggleCartOverlay: () => void
  setCartId: (id: string | null) => void
  setCartItems: (items: CartItem[]) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  setIsCheckingOut: (value: boolean) => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useStore = create<GameStore>((set, get) => ({
  // Initial state
  playerPos: { x: 0, z: 0 },
  playerRot: 0,
  mallBounds: null,
  cartId: null,
  cartItems: [],
  selectedProduct: null,
  selectedProducts: [],
  showProductOverlay: false,
  showCartOverlay: false,
  isCheckingOut: false,

  // Player actions
  setPlayerPos: (pos) => set({ playerPos: pos }),
  setPlayerRot: (rot) => set({ playerRot: rot }),
  setMallBounds: (bounds) => set({ mallBounds: bounds }),

  // Product selection actions
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  addSelectedProduct: (product) =>
    set((state) => {
      const exists = state.selectedProducts.find((p) => p.id === product.id)
      if (exists) return state
      return { 
        selectedProducts: [...state.selectedProducts, product],
        showProductOverlay: false
      }
    }),
  
  removeSelectedProduct: (productId) =>
    set((state) => ({
      selectedProducts: state.selectedProducts.filter((p) => p.id !== productId),
    })),
  
  clearSelectedProducts: () => set({ selectedProducts: [] }),

  // UI toggles
  toggleProductOverlay: () =>
    set((state) => ({ showProductOverlay: !state.showProductOverlay })),
  toggleCartOverlay: () =>
    set((state) => ({ showCartOverlay: !state.showCartOverlay })),

  // Cart actions
  setCartId: (id) => set({ cartId: id }),
  setCartItems: (items) => set({ cartItems: items }),
  addToCart: (item) =>
    set((state) => {
      const existing = state.cartItems.find((i) => i.productId === item.productId)
      if (existing) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        }
      }
      return { cartItems: [...state.cartItems, item] }
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.productId !== productId),
    })),
  clearCart: () => set({ cartItems: [], cartId: null }),
  setIsCheckingOut: (value) => set({ isCheckingOut: value }),

  // Computed values
  getTotalPrice: () => {
    const state = get()
    return state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
  getTotalItems: () => {
    const state = get()
    return state.cartItems.reduce((sum, item) => sum + item.quantity, 0)
  },
}))

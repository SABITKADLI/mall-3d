'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useStore, type GameStore } from '@/lib/store'

export interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  quantity: number
  image: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  image: string
  collectionHandle: string
}

type StoreHook = typeof useStore

const StoreContext = createContext<StoreHook | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <StoreContext.Provider value={useStore}>
      {children}
    </StoreContext.Provider>
  )
}

export function useGameStore(): GameStore {
  const hook = useContext(StoreContext)
  if (!hook) {
    throw new Error('useGameStore must be used within StoreProvider')
  }
  // Call the zustand hook to get the actual state/actions
  return hook()
}

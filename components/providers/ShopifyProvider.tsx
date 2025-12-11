'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface ShopifyContextType {
  shopName: string
  accessToken: string
}

const ShopifyContext = createContext<ShopifyContextType | undefined>(undefined)

export function ShopifyProvider({ children }: { children: ReactNode }) {
  const shopName = process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME || 'shopaustralia'
  const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || ''

  return (
    <ShopifyContext.Provider value={{ shopName, accessToken }}>
      {children}
    </ShopifyContext.Provider>
  )
}

export function useShopify() {
  const context = useContext(ShopifyContext)
  if (!context) {
    throw new Error('useShopify must be used within ShopifyProvider')
  }
  return context
}

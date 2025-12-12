'use client'

import { useState, useEffect } from 'react'
import { useStore, GameStore } from './store'

export function useHydratedStore<T>(selector: (state: GameStore) => T): T | null {
  const storeValue = useStore(selector)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated ? storeValue : null
}

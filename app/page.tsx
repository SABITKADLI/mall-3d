'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

const Scene = dynamic(() => import('@/components/3d/Scene').then(m => ({ default: m.Scene })), {
  loading: () => <LoadingScreen />,
  ssr: false,
})

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
      </Suspense>
    </main>
  )
}

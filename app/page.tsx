'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
// Import the joystick component you created
import { VirtualJoystick } from '@/components/ui/VirtualJoystick'

const Scene = dynamic(() => import('@/components/3d/Scene').then(m => ({ default: m.Scene })), {
  loading: () => <LoadingScreen />,
  ssr: false,
})

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
      </Suspense>
      
      {/* 
        We render the Joystick here so it sits on top of the 3D Scene.
        It will only be visible on mobile screens because of the CSS inside it.
      */}
      <VirtualJoystick />
    </main>
  )
}

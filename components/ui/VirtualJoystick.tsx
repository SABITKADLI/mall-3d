'use client'

import { useEffect, useRef } from 'react'
import nipplejs from 'nipplejs'
import { useStore } from '@/lib/store'

export function VirtualJoystick() {
  const managerRef = useRef<any>(null)
  const setInputVector = useStore((state) => state.setInputVector)
  
  // Track if joystick is active to prevent jitter
  const activeRef = useRef(false)

  useEffect(() => {
    const zone = document.getElementById('joystick-zone')
    if (!zone) return

    // Create the joystick with Darker Colors
    managerRef.current = nipplejs.create({
      zone: zone,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: '#1d4ed8', // Darker Blue (previously #2563eb)
      size: 100,
      // Make the surrounding area darker too
      restOpacity: 0.8,
      fadeTime: 0
    })

    // Handle Movement
    managerRef.current.on('move', (_: any, data: any) => {
      activeRef.current = true
      
      // Convert angle/force to X/Z vector
      // NippleJS 0 degrees is Right (X+), 90 is Up (Y- in 2D, Z- in 3D)
      const angle = data.angle.radian
      const force = Math.min(data.force, 1.0) // Cap speed at 1.0
      
      // Calculate 3D direction (Z is forward/back)
      // Math.cos(angle) is X (Left/Right)
      // -Math.sin(angle) is Z (Forward/Back - negative is forward in 3D)
      const x = Math.cos(angle) * force
      const z = -Math.sin(angle) * force

      setInputVector({ x, z })
    })

    // Handle Release
    managerRef.current.on('end', () => {
      activeRef.current = false
      setInputVector({ x: 0, z: 0 })
    })

    return () => {
      managerRef.current?.destroy()
    }
  }, [setInputVector])

  return (
    <div 
      id="joystick-zone" 
      className="mobile-only"
      style={{ 
        position: 'fixed', 
        bottom: '40px', 
        left: '40px', 
        width: '120px', 
        height: '120px', 
        zIndex: 40,
        touchAction: 'none', // Prevents scrolling while using joystick
        opacity: 1 // Ensure container is fully visible
      }}
    />
  )
}

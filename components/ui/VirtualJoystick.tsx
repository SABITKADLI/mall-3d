'use client'

import { useEffect, useRef } from 'react'
import nipplejs, { JoystickManager, JoystickData } from 'nipplejs'
import { useStore } from '@/lib/store'

export function VirtualJoystick() {
  const managerRef = useRef<JoystickManager | null>(null)
  const setInputVector = useStore((state) => state.setInputVector)

  // Track if joystick is active to prevent jitter
  const activeRef = useRef(false)

  useEffect(() => {
    const zone = document.getElementById('joystick-zone')
    if (!zone) return

    const manager = nipplejs.create({
      zone,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: '#1d4ed8', // Darker blue
      size: 100,
      restOpacity: 0.8,
      fadeTime: 0,
    })

    managerRef.current = manager

    const handleMove = (_evt: unknown, data: JoystickData) => {
      activeRef.current = true

      const angle = data.angle.radian
      const force = Math.min(data.force, 1.0)

      const x = Math.cos(angle) * force
      const z = -Math.sin(angle) * force

      setInputVector({ x, z })
    }

    const handleEnd = () => {
      activeRef.current = false
      setInputVector({ x: 0, z: 0 })
    }

    manager.on('move', handleMove)
    manager.on('end', handleEnd)

    return () => {
      manager.destroy()
      managerRef.current = null
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
        touchAction: 'none',
        opacity: 1,
      }}
    />
  )
}

'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface PlayerProps {
  onPositionChange?: (position: { x: number; z: number }) => void
}

export default function Player({ onPositionChange }: PlayerProps) {
  const meshRef = useRef<Mesh>(null)
  const velocity = useRef({ x: 0, z: 0 })
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!meshRef.current) return

    const speed = 0.1
    const keys = keysPressed.current

    // WASD or Arrow key movement
    if (keys['w'] || keys['arrowup']) velocity.current.z = -speed
    else if (keys['s'] || keys['arrowdown']) velocity.current.z = speed
    else velocity.current.z = 0

    if (keys['a'] || keys['arrowleft']) velocity.current.x = -speed
    else if (keys['d'] || keys['arrowright']) velocity.current.x = speed
    else velocity.current.x = 0

    // Update position
    meshRef.current.position.x += velocity.current.x
    meshRef.current.position.z += velocity.current.z

    // Boundaries
    meshRef.current.position.x = Math.max(-18, Math.min(18, meshRef.current.position.x))
    meshRef.current.position.z = Math.max(-18, Math.min(18, meshRef.current.position.z))

    // Notify parent of position changes
    if (onPositionChange) {
      onPositionChange({
        x: meshRef.current.position.x,
        z: meshRef.current.position.z
      })
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0.5, 8]}>
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial color="#ff6b6b" />
    </mesh>
  )
}

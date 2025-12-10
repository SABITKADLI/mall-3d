'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

interface PlayerProps {
  onPositionChange?: (position: { x: number; z: number }) => void
}

export default function Player({ onPositionChange }: PlayerProps) {
  const groupRef = useRef<Group>(null)
  const velocity = useRef({ x: 0, z: 0 })
  const keysPressed = useRef<Record<string, boolean>>({})

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
    if (!groupRef.current) return

    const speed = 0.1
    const keys = keysPressed.current

    if (keys['w'] || keys['arrowup']) velocity.current.z = -speed
    else if (keys['s'] || keys['arrowdown']) velocity.current.z = speed
    else velocity.current.z = 0

    if (keys['a'] || keys['arrowleft']) velocity.current.x = -speed
    else if (keys['d'] || keys['arrowright']) velocity.current.x = speed
    else velocity.current.x = 0

    groupRef.current.position.x += velocity.current.x
    groupRef.current.position.z += velocity.current.z

    groupRef.current.position.x = Math.max(-18, Math.min(18, groupRef.current.position.x))
    groupRef.current.position.z = Math.max(-18, Math.min(18, groupRef.current.position.z))

    if (velocity.current.x !== 0 || velocity.current.z !== 0) {
      const angle = Math.atan2(velocity.current.x, velocity.current.z)
      groupRef.current.rotation.y = angle
    }

    if (onPositionChange) {
      onPositionChange({
        x: groupRef.current.position.x,
        z: groupRef.current.position.z
      })
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 8]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        apsuleGeometry args={[0.25, 0.6, 8, 16]} 
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>

      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffb6b6" />
      </mesh>

      <group position={[0.5, 0.3, -0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.4, 0.35]} />
          <meshStandardMaterial color="#4ecdc4" wireframe={true} />
        </mesh>

        <mesh position={[-0.3, 0.15, 0]}>
          ylinderGeometry args={[0.02, 0.02, 0.5, 8]} 
          <meshStandardMaterial color="#2c3e50" />
        </mesh>

        <mesh position={[0.2, -0.25, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
          ylinderGeometry args={[0.06, 0.06, 0.05, 16]} 
          <meshStandardMaterial color="#34495e" />
        </mesh>

        <mesh position={[0.2, -0.25, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
          ylinderGeometry args={[0.06, 0.06, 0.05, 16]} 
          <meshStandardMaterial color="#34495e" />
        </mesh>

        <mesh position={[-0.2, -0.25, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
          ylinderGeometry args={[0.06, 0.06, 0.05, 16]} 
          <meshStandardMaterial color="#34495e" />
        </mesh>

        <mesh position={[-0.2, -0.25, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
          ylinderGeometry args={[0.06, 0.06, 0.05, 16]} 
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        ircleGeometry args={[0.8, 32]} 
        <meshStandardMaterial color="#000000" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

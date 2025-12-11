'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useStore } from '@/lib/store'

interface KeyState {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
  arrowUp: boolean
  arrowDown: boolean
  arrowLeft: boolean
  arrowRight: boolean
}

const SPEED = 0.15
const BOB_SPEED = 8
const BOB_AMOUNT = 0.08

// Default fallback bounds (used until mall dimensions are loaded)
const DEFAULT_BOUNDS = {
  minX: -39,
  maxX: 39,
  minZ: -69,
  maxZ: 69,
}

export function Player() {
  const groupRef = useRef<Group>(null)
  const bobOffset = useRef(0)
  const keysRef = useRef<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false,
  })

  const setPlayerPos = useStore((state) => state.setPlayerPos)
  const setPlayerRot = useStore((state) => state.setPlayerRot)
  
  // Get dynamic bounds from store
  const mallBounds = useStore((state) => state.mallBounds)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'w') keysRef.current.w = true
      if (key === 'a') keysRef.current.a = true
      if (key === 's') keysRef.current.s = true
      if (key === 'd') keysRef.current.d = true
      if (e.key === 'ArrowUp') keysRef.current.arrowUp = true
      if (e.key === 'ArrowDown') keysRef.current.arrowDown = true
      if (e.key === 'ArrowLeft') keysRef.current.arrowLeft = true
      if (e.key === 'ArrowRight') keysRef.current.arrowRight = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'w') keysRef.current.w = false
      if (key === 'a') keysRef.current.a = false
      if (key === 's') keysRef.current.s = false
      if (key === 'd') keysRef.current.d = false
      if (e.key === 'ArrowUp') keysRef.current.arrowUp = false
      if (e.key === 'ArrowDown') keysRef.current.arrowDown = false
      if (e.key === 'ArrowLeft') keysRef.current.arrowLeft = false
      if (e.key === 'ArrowRight') keysRef.current.arrowRight = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const keys = keysRef.current
    let moveX = 0
    let moveZ = 0

    if (keys.w || keys.arrowUp) moveZ -= SPEED
    if (keys.s || keys.arrowDown) moveZ += SPEED
    if (keys.a || keys.arrowLeft) moveX -= SPEED
    if (keys.d || keys.arrowRight) moveX += SPEED

    const isMoving = moveX !== 0 || moveZ !== 0

    // Use dynamic bounds from store, fallback to default if not loaded yet
    const BOUNDS = mallBounds || DEFAULT_BOUNDS

    if (isMoving) {
      const newX = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, groupRef.current.position.x + moveX))
      const newZ = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, groupRef.current.position.z + moveZ))

      groupRef.current.position.x = newX
      groupRef.current.position.z = newZ

      const angle = Math.atan2(moveX, moveZ)
      groupRef.current.rotation.y = angle
      setPlayerRot(angle)

      bobOffset.current += delta * BOB_SPEED
      groupRef.current.position.y = Math.abs(Math.sin(bobOffset.current)) * BOB_AMOUNT
    } else {
      groupRef.current.position.y = 0
      bobOffset.current = 0
    }

    setPlayerPos({
      x: groupRef.current.position.x,
      z: groupRef.current.position.z,
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Player body - pink box */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1, 0.6]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>

      {/* Face direction indicator - blue box */}
      <mesh position={[0, 0.5, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  )
}

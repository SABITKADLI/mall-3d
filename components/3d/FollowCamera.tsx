'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useStore } from '@/lib/store'

export function FollowCamera() {
  const { camera } = useThree()
  const targetRef = useRef(new Vector3())
  const playerPos = useStore((state) => state.playerPos)

  useFrame(() => {
    const CAMERA_DISTANCE = 15
    const CAMERA_HEIGHT = 10
    const CAMERA_ANGLE = Math.PI / 4 // 45 degrees

    // Desired camera position relative to player (current position from store)
    targetRef.current.set(
      playerPos.x + CAMERA_DISTANCE * Math.sin(CAMERA_ANGLE),
      CAMERA_HEIGHT,
      playerPos.z + CAMERA_DISTANCE * Math.cos(CAMERA_ANGLE)
    )

    // Smoothly move camera toward target
    camera.position.lerp(targetRef.current, 0.08)
    
    // Look at the player's current position (not fixed at origin)
    camera.lookAt(playerPos.x, 0, playerPos.z)
  })

  return null
}
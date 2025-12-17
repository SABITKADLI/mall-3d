'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useStore } from '@/lib/store'

export function FollowCamera() {
  const { camera } = useThree()
  const targetRef = useRef(new Vector3())
  const playerPos = useStore((state) => state.playerPos)
  const playerRot = useStore((state) => state.playerRot)

  // Camera BEHIND player, elevated, looking forward
  useEffect(() => {
    camera.position.set(0, 7.5, -9)
    camera.lookAt(0, 1.2, 15)
  }, [camera])

  useFrame(() => {
    const CAMERA_DISTANCE = 9
    const CAMERA_HEIGHT = 7.5

    // Offset behind player based on rotation (third-person, shoulder-height)
    const offsetX = Math.sin(playerRot) * -CAMERA_DISTANCE
    const offsetZ = Math.cos(playerRot) * -CAMERA_DISTANCE

    targetRef.current.set(
      playerPos.x + offsetX,
      CAMERA_HEIGHT,
      playerPos.z + offsetZ
    )

    camera.position.lerp(targetRef.current, 0.1)
    camera.lookAt(playerPos.x, 1.2, playerPos.z + Math.cos(playerRot) * 2)
  })

  return null
}

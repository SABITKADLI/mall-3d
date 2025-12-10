'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

interface FollowCameraProps {
  targetPosition: { x: number; z: number }
}

export default function FollowCamera({ targetPosition }: FollowCameraProps) {
  const { camera } = useThree()

  useFrame(() => {
    const offset = { x: 0, y: 8, z: 12 }
    
    const targetCameraPosition = new Vector3(
      targetPosition.x + offset.x,
      offset.y,
      targetPosition.z + offset.z
    )

    // Smooth camera follow
    camera.position.lerp(targetCameraPosition, 0.1)
    camera.lookAt(targetPosition.x, 0.5, targetPosition.z)
  })

  return null
}

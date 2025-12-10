'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Player from './Player'
import FollowCamera from './FollowCamera'
import ProductOverlay from './ProductOverlay'
import { useDepartmentDetection, departments } from './DepartmentManager'

export default function Scene() {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 8 })
  const currentDepartment = useDepartmentDetection(playerPosition)

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Mall Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* Department zones */}
        {departments.map(dept => (
          <mesh 
            key={dept.id}
            position={[
              (dept.bounds.minX + dept.bounds.maxX) / 2,
              1,
              (dept.bounds.minZ + dept.bounds.maxZ) / 2
            ]}
          >
            <boxGeometry args={[
              dept.bounds.maxX - dept.bounds.minX,
              2,
              dept.bounds.maxZ - dept.bounds.minZ
            ]} />
            <meshStandardMaterial color={dept.color} transparent opacity={0.6} />
          </mesh>
        ))}

        <Player onPositionChange={setPlayerPosition} />
        <FollowCamera targetPosition={playerPosition} />
      </Canvas>

      <ProductOverlay department={currentDepartment} />

      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg">
        <p className="font-bold mb-2">Controls:</p>
        <p>WASD or Arrow Keys to move</p>
      </div>
    </div>
  )
}

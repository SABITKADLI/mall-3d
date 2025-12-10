'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Player from './Player'
import FollowCamera from './FollowCamera'

export default function Scene() {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 8 })

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
        
        {/* Department - Electronics */}
        <mesh position={[-8, 1, -5]}>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#4a90e2" />
        </mesh>
        
        {/* Department - Home */}
        <mesh position={[8, 1, -5]}>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#e27d60" />
        </mesh>
        
        {/* Department - Fashion */}
        <mesh position={[0, 1, -12]}>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#85e2a6" />
        </mesh>

        <Player onPositionChange={setPlayerPosition} />
        <FollowCamera targetPosition={playerPosition} />
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg">
        <p className="font-bold mb-2">Controls:</p>
        <p>WASD or Arrow Keys to move</p>
      </div>
    </div>
  )
}

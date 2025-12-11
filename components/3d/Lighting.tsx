'use client'

export function Lighting() {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.6} color="#ffffff" />

      {/* Directional light (sun) */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Fill light */}
      <pointLight position={[-10, 5, -10]} intensity={0.4} color="#e0e7ff" />
    </>
  )
}

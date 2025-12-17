'use client'

export function Lighting() {
  return (
    <>
      {/** Visual: Bright but soft global fill */}
      <ambientLight intensity={0.6} color="#ffffff" />

      {/** Visual: Natural skylight tint */}
      <hemisphereLight args={[0xffffff, 0xb0b0b0, 0.5]} />

      {/** Visual: Soft key light simulating skylight */}
      <directionalLight
        position={[20, 25, -5]}
        intensity={0.9}
        color="#fff3e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/** Visual: Gentle fill to reduce contrast */}
      <pointLight position={[-15, 10, -10]} intensity={0.35} color="#ffffff" />

      {/** Visual: Warm shop accent lighting */}
      <pointLight position={[10, 4, 20]} intensity={0.28} color="#f59e0b" />
    </>
  )
}

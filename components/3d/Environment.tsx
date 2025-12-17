'use client'

import { Environment as DreiEnvironment, ContactShadows } from '@react-three/drei'

export function Environment() {
  return (
    <>
      {/** Visual: Soft skylight for bright but gentle global illumination */}
      <DreiEnvironment preset="city" background={false} />

      {/** Visual: Subtle contact shadows to ground objects without harshness */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={80}
        blur={2.2}
        far={20}
      />
    </>
  )
}

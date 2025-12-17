'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Object3D, AnimationClip } from 'three'
import { useStore } from '@/lib/store'
import { useGLTF, useAnimations } from '@react-three/drei'

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
const IDLE_DELAY = 60

const DEFAULT_BOUNDS = {
  minX: -39,
  maxX: 39,
  minZ: -100,
  maxZ: 500,
}

interface GLTFResult {
  scene: Object3D
  animations: AnimationClip[]
}

useGLTF.preload('/assets/3d/player/character.glb')

export function Player() {
  const rootRef = useRef<Group>(null)
  const visualRef = useRef<Group>(null)

  const armBonesRef = useRef<{
    left?: Object3D
    right?: Object3D
  }>({})

  const bobOffset = useRef(0)
  const prevMovingRef = useRef(false)
  const idleTimer = useRef(0)
  const isPlayingIdleAnim = useRef(false)

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
  const mallBounds = useStore((state) => state.mallBounds)
  const inputVector = useStore((state) => state.inputVector)

  const gltf = useGLTF(
    '/assets/3d/player/character.glb',
    true,
  ) as unknown as GLTFResult

  const { actions, names: clipNames, mixer } = useAnimations(
    gltf?.animations || [],
    gltf?.scene as Object3D,
  )

  const idleClipName = useMemo(
    () => (clipNames || []).find((n: string) => /idle/i.test(n)),
    [clipNames],
  )

  const walkClipName = useMemo(
    () =>
      (clipNames || []).find((n: string) => /walk|run/i.test(n)) ||
      clipNames?.[0],
    [clipNames],
  )

  // Helper: relaxed idle pose based on your walk values
  const applyRelaxedArms = () => {
    const left = armBonesRef.current.left
    const right = armBonesRef.current.right
    if (left) {
      // from walk: x≈-0.15, y≈1.18, z≈0.10
      left.rotation.x = -0.01   // less swing
      left.rotation.y = 1.18    // keep around-body rotation
      left.rotation.z = 0.02    // almost no roll
    }
    if (right) {
      // from walk: x≈-0.20, y≈1.18, z≈-0.03
      right.rotation.x = -0.05
      right.rotation.y = 1.18
      right.rotation.z = -0.02
    }
  }

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.position.set(0, 0, 0)
      setPlayerPos({ x: 0, z: 0 })
      setPlayerRot(0)
    }
  }, [setPlayerPos, setPlayerRot])

  // Find arm bones and set initial relaxed pose
  useEffect(() => {
    if (!gltf?.scene) return

    gltf.scene.traverse((obj) => {
      const n = obj.name.toLowerCase()

      if (n.includes('upperarm_l')) {
        armBonesRef.current.left = obj
      }
      if (n.includes('upperarm_r')) {
        armBonesRef.current.right = obj
      }
    })

    console.log('ARM BONES:', {
      left: armBonesRef.current.left?.name,
      right: armBonesRef.current.right?.name,
    })

    // Wait a frame so skeleton is ready, then pose
    requestAnimationFrame(() => {
      applyRelaxedArms()
      console.log('✅ Applied relaxed arms at start')
    })
  }, [gltf?.scene])

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

  useFrame((_, delta) => {
    if (!rootRef.current || !visualRef.current) return

    const keys = keysRef.current
    let moveX = 0
    let moveZ = 0

    if (keys.w || keys.arrowUp) moveZ += SPEED
    if (keys.s || keys.arrowDown) moveZ -= SPEED
    if (keys.a || keys.arrowLeft) moveX -= SPEED
    if (keys.d || keys.arrowRight) moveX += SPEED

    if (inputVector.x !== 0 || inputVector.z !== 0) {
      moveX += inputVector.x * SPEED
      moveZ += inputVector.z * SPEED
    }

    const isMoving = moveX !== 0 || moveZ !== 0
    const bounds = mallBounds || DEFAULT_BOUNDS
    const root = rootRef.current
    const visual = visualRef.current

    if (isMoving) {
      const newX = Math.max(
        bounds.minX,
        Math.min(bounds.maxX, root.position.x + moveX),
      )
      const newZ = Math.max(
        bounds.minZ,
        Math.min(bounds.maxZ, root.position.z + moveZ),
      )

      root.position.x = newX
      root.position.z = newZ

      const angle = Math.atan2(moveX, moveZ)
      root.rotation.y = angle
      setPlayerRot(angle)

      bobOffset.current += delta * BOB_SPEED
      visual.position.y = Math.abs(Math.sin(bobOffset.current)) * BOB_AMOUNT

      idleTimer.current = 0
      isPlayingIdleAnim.current = false
    } else {
      visual.position.y = 0
      bobOffset.current = 0
      idleTimer.current += delta
    }

    setPlayerPos({ x: root.position.x, z: root.position.z })

    if (!actions) return

    if (isMoving !== prevMovingRef.current) {
      if (isMoving) {
        if (idleClipName && actions[idleClipName]) {
          actions[idleClipName].stop()
        }
        if (walkClipName && actions[walkClipName]) {
          actions[walkClipName].reset().play()
        }
        isPlayingIdleAnim.current = false
      } else {
        if (walkClipName && actions[walkClipName]) {
          actions[walkClipName].stop()
        }
        if (idleClipName && actions[idleClipName]) {
          actions[idleClipName].stop()
        }
        mixer?.stopAllAction()
        isPlayingIdleAnim.current = false

        // Just stopped moving → re-apply relaxed arms once
        applyRelaxedArms()
        console.log('✅ Applied relaxed arms after stop')
      }
      prevMovingRef.current = isMoving
    }

    if (
      !isMoving &&
      !isPlayingIdleAnim.current &&
      idleTimer.current >= IDLE_DELAY &&
      idleClipName &&
      actions[idleClipName]
    ) {
      actions[idleClipName].reset().play()
      isPlayingIdleAnim.current = true
    }
  })

  return (
    <group ref={rootRef} position={[0, 0, 0]}>
      {gltf?.scene ? (
        <group ref={visualRef} scale={0.9} position={[0, 0, 0]}>
          <primitive object={gltf.scene} castShadow receiveShadow />
        </group>
      ) : (
        <group ref={visualRef}>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.45, 0.8, 8, 16]} />
            <meshPhysicalMaterial
              color="#d1d5db"
              roughness={0.6}
              metalness={0.1}
              clearcoat={0.4}
              clearcoatRoughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.42, 0.25, 16]} />
            <meshPhysicalMaterial
              color="#374151"
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.3, 0.6]} />
            <meshPhysicalMaterial
              color="#111827"
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
          <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.55, 0.3, 0.6]} />
            <meshPhysicalMaterial
              color="#111827"
              roughness={0.5}
              metalness={0.1}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}
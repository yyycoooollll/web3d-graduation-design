'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Preload, PerspectiveCamera } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import useSceneStore from '@/store/sceneStore'
import IntroText from '@/components/canvas/IntroText'
import DissolveMap from '@/components/canvas/DissolveMap'
import * as THREE from 'three'
import { useRef } from 'react'

function SceneContent({ onMapDissolveComplete }) {
  const { sceneState } = useSceneStore()
  const { scene } = useThree()
  const bgColorRef = useRef(new THREE.Color(1, 1, 1))

  // 每帧更新背景色
  useFrame(() => {
    scene.background = bgColorRef.current
  })

  return (
    <>
      <PerspectiveCamera makeDefault fov={50} position={[0, 0, 8]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {sceneState === 'intro' && <IntroText />}
      {sceneState === 'map' && <DissolveMap onDissolveComplete={onMapDissolveComplete} />}

      {/* @ts-ignore */}
      <r3f.Out />
      <Preload all />
    </>
  )
}

export default function Scene({ onMapDissolveComplete, ...props }) {
  return (
    <Canvas
      {...props}
      style={{
        ...props.style,
        pointerEvents: 'auto',
      }}
      onCreated={(state) => {
        state.gl.toneMapping = THREE.AgXToneMapping
        state.scene.background = new THREE.Color(1.0, 1.0, 1.0)
        state.gl.shadowMap.enabled = true
      }}
    >
      <SceneContent onMapDissolveComplete={onMapDissolveComplete} />
    </Canvas>
  )
}

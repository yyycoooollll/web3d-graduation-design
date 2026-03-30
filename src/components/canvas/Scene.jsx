'use client'

import { Canvas } from '@react-three/fiber'
import { Preload, PerspectiveCamera } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import useSceneStore from '@/store/sceneStore'
import IntroText from '@/components/canvas/IntroText'
import DissolveMap from '@/components/canvas/DissolveMap'
import * as THREE from 'three'

function SceneContent() {
  const { sceneState } = useSceneStore()

  return (
    <>
      <PerspectiveCamera makeDefault fov={50} position={[0, 0, 8]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {sceneState === 'intro' && <IntroText />}
      {sceneState === 'map' && <DissolveMap />}

      {/* @ts-ignore */}
      <r3f.Out />
      <Preload all />
    </>
  )
}

export default function Scene({ ...props }) {
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
      }}
    >
      <SceneContent />
    </Canvas>
  )
}

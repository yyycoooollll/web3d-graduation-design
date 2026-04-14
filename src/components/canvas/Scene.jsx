'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { Preload, PerspectiveCamera } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import useSceneStore from '@/store/sceneStore'
import IntroText from '@/components/canvas/IntroText'
import DissolveMap from '@/components/canvas/DissolveMap'
import PrefaceScene from '@/components/canvas/PrefaceScene'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function BackgroundUpdater() {
  const { scene } = useThree()
  const { backgroundOpacity } = useSceneStore()

  useEffect(() => {
    if (scene) {
      // 从白色 (1,1,1) 到黑色 (0,0,0)
      const r = backgroundOpacity
      const g = backgroundOpacity
      const b = backgroundOpacity
      scene.background = new THREE.Color(r, g, b)
    }
  }, [backgroundOpacity, scene])

  return null
}

function CameraUpdater() {
  const { camera } = useThree()
  const { sceneState } = useSceneStore()

  useEffect(() => {
    if (!camera) return

    // 根据场景状态更新相机位置
    if (sceneState === 'preface_start' || sceneState === 'preface_active') {
      // Preface 场景：相机位置在 (0, 100, 2000)
      gsap.to(camera.position, {
        x: 0,
        y: 100,
        z: 2000,
        duration: 1,
        ease: 'power2.inOut',
      })
    } else {
      // 其他场景：相机位置在 (0, 0, 8)
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 8,
        duration: 1,
        ease: 'power2.inOut',
      })
    }
  }, [sceneState, camera])

  return null
}

function SceneContent() {
  const { sceneState } = useSceneStore()

  return (
    <>
      <BackgroundUpdater />
      <CameraUpdater />
      {/* 
        相机配置注意：
        ⚠️ far 属性必须足够大（100000+）来渲染超大的 Sky 组件
        若 Preface 场景中天空不显示，第一时间检查此处的 far 值
        
        相机自动切换：
        - 普通场景：(0, 0, 8)
        - Preface 场景：(0, 100, 2000) 用于展示完整天空
      */}
      <PerspectiveCamera makeDefault fov={50} position={[0, 0, 8]} far={100000} />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {sceneState === 'intro' && <IntroText />}
      {sceneState === 'map' && <DissolveMap />}
      {(sceneState === 'preface_start' || sceneState === 'preface_active') && <PrefaceScene />}

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

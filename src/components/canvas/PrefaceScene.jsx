'use client'

import { useThree } from '@react-three/fiber'
import { Sky, OrbitControls } from '@react-three/drei'
import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

// ============ GUI 参数默认值 ============
const defaultControls = {
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    elevation: 2,
    azimuth: 180,
    exposure: 0.5,
    cloudCoverage: 0.5,
    cloudDensity: 0.5,
    cloudElevation: 0.3,
}

const PrefaceScene = forwardRef(({ ...props }, ref) => {
    const groupRef = useRef()
    const sunRef = useRef(new THREE.Vector3())
    const { camera } = useThree()

    // ============ 1. 状态：GUI 控制参数 ============
    const [effectController, setEffectController] = useState(defaultControls)

    useImperativeHandle(ref, () => groupRef.current)

    // ============ 2. 场景初始化 ============
    useEffect(() => {
        if (camera) {
            camera.position.set(0, 100, 2000)
            camera.lookAt(0, 0, 0)
        }
    }, [camera])

    // ============ 3. 太阳位置计算：球面坐标 ============
    useEffect(() => {
        // 根据高度角和方位角计算三维坐标
        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation)
        const theta = THREE.MathUtils.degToRad(effectController.azimuth)
        sunRef.current.setFromSphericalCoords(1, phi, theta)
    }, [effectController.elevation, effectController.azimuth])

    // ============ 4. 监听 GUI 面板的参数变化事件 ============
    useEffect(() => {
        const handleSkyControlChange = (event) => {
            const { controller } = event.detail
            setEffectController(controller)
        }

        window.addEventListener('skyControlChange', handleSkyControlChange)
        return () => window.removeEventListener('skyControlChange', handleSkyControlChange)
    }, [])

    return (
        <group ref={groupRef} {...props}>
            {/* 3D 天空球体 */}
            <Sky
                sunPosition={[
                    sunRef.current.x * 1000,
                    sunRef.current.y * 1000,
                    sunRef.current.z * 1000,
                ]}
                distance={50000}
                inclination={effectController.elevation / 180}
                azimuth={effectController.azimuth / 180}
                turbidity={effectController.turbidity}
                rayleigh={effectController.rayleigh}
                mieCoefficient={effectController.mieCoefficient}
                mieDirectionalG={effectController.mieDirectionalG}
            />

            {/* 轨道控制 - 禁用缩放和平移（仅允许旋转） */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={false}
                enableDamping={true}
                dampingFactor={0.05}
            />
        </group>
    )
})

PrefaceScene.displayName = 'PrefaceScene'

export default PrefaceScene



'use client'

import * as THREE from 'three'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import dissolveVert from '@/templates/Shader/glsl/dissolve.vert'
import dissolveAdvancedFrag from '@/templates/Shader/glsl/dissolve-advanced.frag'
import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'

const DissolveAdvancedShaderImpl = shaderMaterial(
    {
        uMap: null,
        uNoise: null,
        uDissolve: 0,
        uBgColor: new THREE.Color(1.0, 1.0, 1.0),
        uVignetteIntensity: 1.0,
        uVignetteNoiseScale: 0.8,      // 控制噪声纹理缩放，越小边缘越不规则
        uVignetteFeatherRange: 0.42,   // 控制羽化范围，越大白色区域越小
    },
    dissolveVert,
    dissolveAdvancedFrag,
)

extend({ DissolveAdvancedShaderImpl })

// eslint-disable-next-line react/display-name
const DissolveMapAdvanced = forwardRef(({ scale = 1, position = [0, 0, 0], ...props }, ref) => {
    const localRef = useRef()
    const meshRef = useRef()
    const { gl, camera, size } = useThree()
    const [textures, setTextures] = useState({ map: null, noise: null })
    const [bgColor, setBgColor] = useState(new THREE.Color(1.0, 1.0, 1.0))
    const dissolveRef = useRef(0)
    const targetDissolveRef = useRef(0)
    const lastWheelTimeRef = useRef(0)

    // 鼠标跟随视差效果
    const parallaxTargetRef = useRef({ x: 0, y: 0 })
    const parallaxCurrentRef = useRef({ x: 0, y: 0 })
    const maxParallaxRef = useRef({ x: 0.8, y: 0.5 })

    useImperativeHandle(ref, () => localRef.current)

    // 加载纹理并提取背景色
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader()
        let cancelled = false

        const handleTextureLoad = (type, texture) => {
            if (cancelled) return
            texture.colorSpace = type === 'map' ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace
            setTextures(prev => ({ ...prev, [type]: texture }))
        }

        textureLoader.load('/map.png', (tex) => handleTextureLoad('map', tex))
        textureLoader.load('/noise.png', (tex) => handleTextureLoad('noise', tex))

        return () => {
            cancelled = true
        }
    }, [])

    // 更新shader中的纹理和背景色
    useEffect(() => {
        if (localRef.current && textures.map && textures.noise) {
            localRef.current.uMap = textures.map
            localRef.current.uNoise = textures.noise
            localRef.current.uBgColor = bgColor
            localRef.current.uVignetteIntensity = 1.0
            localRef.current.uVignetteNoiseScale = 0.8
            localRef.current.uVignetteFeatherRange = 0.42
        }
    }, [textures, bgColor])

    // 鼠标滚轮事件处理
    useEffect(() => {
        const handleWheel = (e) => {
            const now = Date.now()

            if (now - lastWheelTimeRef.current < 30) {
                return
            }
            lastWheelTimeRef.current = now

            if (e.deltaY > 0) {
                targetDissolveRef.current = Math.min(targetDissolveRef.current + 0.05, 1.0)
            } else {
                targetDissolveRef.current = Math.max(targetDissolveRef.current - 0.05, 0)
            }
        }

        gl.domElement.addEventListener('wheel', handleWheel, { passive: true })

        return () => {
            gl.domElement.removeEventListener('wheel', handleWheel)
        }
    }, [gl])

    // 动画帧更新
    useFrame((state) => {
        // 溶解效果更新
        if (localRef.current) {
            dissolveRef.current += (targetDissolveRef.current - dissolveRef.current) * 0.08
            localRef.current.uDissolve = Math.max(0, Math.min(1, dissolveRef.current))
        }

        // ========== 视差鼠标跟随效果 ==========
        const mouseX = state.mouse.x
        const mouseY = state.mouse.y

        parallaxTargetRef.current.x = -mouseX * maxParallaxRef.current.x
        parallaxTargetRef.current.y = mouseY * maxParallaxRef.current.y

        parallaxCurrentRef.current.x += (parallaxTargetRef.current.x - parallaxCurrentRef.current.x) * 0.08
        parallaxCurrentRef.current.y += (parallaxTargetRef.current.y - parallaxCurrentRef.current.y) * 0.08

        if (meshRef.current) {
            meshRef.current.position.x = position[0] + parallaxCurrentRef.current.x
            meshRef.current.position.y = position[1] + parallaxCurrentRef.current.y
            meshRef.current.position.z = position[2] || 0
        }

        if (meshRef.current && textures.map) {
            const vFOV = (camera.fov * Math.PI) / 180
            const height = 2 * Math.tan(vFOV / 2) * camera.position.z
            const width = height * (size.width / size.height)

            const mapAspect = textures.map.source.data.width / textures.map.source.data.height

            let planeWidth, planeHeight
            if (width / height > mapAspect) {
                planeHeight = height
                planeWidth = planeHeight * mapAspect
            } else {
                planeWidth = width
                planeHeight = planeWidth / mapAspect
            }

            meshRef.current.geometry.dispose()
            meshRef.current.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
        }
    })

    return (
        <mesh ref={meshRef} position={position} {...props}>
            <planeGeometry args={[8, 4.5]} />
            <dissolveAdvancedShaderImpl ref={localRef} attach='material' />
        </mesh>
    )
})

DissolveMapAdvanced.displayName = 'DissolveMapAdvanced'

export default DissolveMapAdvanced

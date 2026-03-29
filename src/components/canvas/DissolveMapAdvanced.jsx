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
    },
    dissolveVert,
    dissolveAdvancedFrag,
)

extend({ DissolveAdvancedShaderImpl })

// eslint-disable-next-line react/display-name
const DissolveMapAdvanced = forwardRef(({ scale = 1, position = [0, 0, 0], ...props }, ref) => {
    const localRef = useRef()
    const { gl } = useThree()
    const [textures, setTextures] = useState({ map: null, noise: null })
    const dissolveRef = useRef(0)
    const targetDissolveRef = useRef(0)
    const lastWheelTimeRef = useRef(0)

    useImperativeHandle(ref, () => localRef.current)

    // 加载纹理
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

    // 更新shader中的纹理
    useEffect(() => {
        if (localRef.current && textures.map && textures.noise) {
            localRef.current.uMap = textures.map
            localRef.current.uNoise = textures.noise
        }
    }, [textures])

    // 鼠标滚轮事件处理
    useEffect(() => {
        const handleWheel = (e) => {
            const now = Date.now()

            // 限制滚轮响应频率
            if (now - lastWheelTimeRef.current < 30) {
                return
            }
            lastWheelTimeRef.current = now

            // 根据滚轮方向设置目标值
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
    useFrame(() => {
        if (localRef.current) {
            dissolveRef.current += (targetDissolveRef.current - dissolveRef.current) * 0.08
            localRef.current.uDissolve = Math.max(0, Math.min(1, dissolveRef.current))
        }
    })

    const mapW = 8 * scale
    const mapH = 4.5 * scale

    return (
        <mesh position={position} {...props}>
            <planeGeometry args={[mapW, mapH]} />
            <dissolveAdvancedShaderImpl ref={localRef} attach='material' />
        </mesh>
    )
})

DissolveMapAdvanced.displayName = 'DissolveMapAdvanced'

export default DissolveMapAdvanced

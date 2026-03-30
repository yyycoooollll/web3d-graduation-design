'use client'

import { Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import useSceneStore from '@/store/sceneStore'

const IntroText = forwardRef(({ position = [0, 0, 0], ...props }, ref) => {
    const groupRef = useRef()
    const chineseTextRef = useRef()
    const englishTextRef = useRef()
    const { gl } = useThree()
    const { setSceneState, setShowClickTip, setWhiteScreenOpacity } = useSceneStore()

    const [hasClicked, setHasClicked] = useState(false)
    const [progress, setProgress] = useState(0)
    const fadeInCompleteRef = useRef(false)
    const noiseMaterialsRef = useRef([])

    // 鼠标视差
    const parallaxTargetRef = useRef({ x: 0, y: 0 })
    const parallaxCurrentRef = useRef({ x: 0, y: 0 })
    const maxParallaxRef = useRef({ x: 0.3, y: 0.3 })

    useImperativeHandle(ref, () => groupRef.current)

    // 加载噪声纹理并应用到文字材质
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader()

        // 加载或生成噪声纹理
        let noiseTexture = null

        // 尝试加载 noise.png，如果失败则生成
        textureLoader.load('/img/noise.png',
            (texture) => {
                noiseTexture = texture
                applyNoiseMaterial()
            },
            undefined,
            () => {
                // 如果加载失败，生成 SimplexNoise 或 PerlinNoise
                console.log('noise.png 不存在，生成程序化噪声纹理')
                noiseTexture = generateNoiseTexture()
                applyNoiseMaterial()
            }
        )

        function applyNoiseMaterial() {
            if (!noiseTexture) return

            // 为中文和英文文字应用自定义着色器
            const applyShaderToText = (textRef) => {
                if (!textRef.current || !textRef.current.material) return

                const originalMaterial = textRef.current.material

                // 保存原始属性
                const originalOnBeforeCompile = originalMaterial.onBeforeCompile

                originalMaterial.onBeforeCompile = (shader) => {
                    // 调用原始的 onBeforeCompile（如果有）
                    if (originalOnBeforeCompile) {
                        originalOnBeforeCompile(shader)
                    }

                    // 注入 uniform
                    shader.uniforms.u_noiseTex = { value: noiseTexture }
                    shader.uniforms.u_progress = { value: progress }

                    // 修改 fragment shader
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <map_fragment>',
                        `
            #include <map_fragment>
            
            // 噪声溶解效果
            vec3 noiseColor = texture2D(u_noiseTex, vUv).rgb;
            float noiseValue = noiseColor.r;
            
            // 根据 progress 和噪声来确定像素是否保留
            float dissolveThreshold = mix(1.0, 0.0, u_progress);
            float fade = smoothstep(dissolveThreshold - 0.1, dissolveThreshold + 0.1, noiseValue);
            
            // 应用强度
            diffuseColor.a *= fade;
            `
                    )

                    noiseMaterialsRef.current.push(shader.uniforms)
                }

                originalMaterial.transparent = true
                originalMaterial.needsUpdate = true
            }

            applyShaderToText(chineseTextRef)
            applyShaderToText(englishTextRef)
        }

        return () => {
            if (noiseTexture) noiseTexture.dispose()
        }
    }, [])

    // 生成程序化噪声纹理
    function generateNoiseTexture() {
        const width = 256
        const height = 256
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        // 简单的 Perlin-like noise 替代品：使用多个 sin 波
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value =
                    Math.sin((x * 0.01) * 10) * 0.5 +
                    Math.sin((y * 0.01) * 10) * 0.3 +
                    Math.sin((x * y * 0.0001) * 5) * 0.2
                const gray = Math.floor(((value + 1) / 2) * 255)
                ctx.fillStyle = `rgb(${gray},${gray},${gray})`
                ctx.fillRect(x, y, 1, 1)
            }
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearFilter
        return texture
    }

    // 点击处理
    const handleClick = () => {
        if (hasClicked) return

        setHasClicked(true)
        setShowClickTip(false)

        console.log('✓ 文字被点击，触发溶解动画')

        const timeline = gsap.timeline()
        const progressObj = { value: progress }

        // 噪声溶解动画（3 秒）
        timeline.to(
            progressObj,
            {
                value: 1.0,
                duration: 3.0,
                ease: 'power2.inOut',
                onUpdate() {
                    setProgress(progressObj.value)
                    // 更新所有材质的 u_progress uniform
                    noiseMaterialsRef.current.forEach((uniforms) => {
                        if (uniforms.u_progress) {
                            uniforms.u_progress.value = progressObj.value
                        }
                    })
                },
            },
            0
        )

        // 白屏闪烁（从 progress 1.5s 开始，与溶解重叠）
        const whiteScreenObj = { opacity: 0 }
        timeline.to(
            whiteScreenObj,
            {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.inOut',
                onUpdate() {
                    setWhiteScreenOpacity(whiteScreenObj.opacity)
                },
                onComplete() {
                    setSceneState('map')
                    console.log('✓ 场景切换到 map')
                },
            },
            '-=1.5'
        )

        // 白屏消散
        timeline.to(whiteScreenObj, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate() {
                setWhiteScreenOpacity(whiteScreenObj.opacity)
            },
        })
    }

    // 每帧更新
    useFrame((state) => {
        // 初始淡入（前 2 秒）
        if (!fadeInCompleteRef.current) {
            const newProgress = Math.min(progress + 0.016 / 2, 1.0)
            setProgress(newProgress)

            // 更新材质的 u_progress
            noiseMaterialsRef.current.forEach((uniforms) => {
                if (uniforms.u_progress) {
                    uniforms.u_progress.value = newProgress
                }
            })

            if (newProgress >= 1.0) {
                fadeInCompleteRef.current = true
                setTimeout(() => {
                    if (!hasClicked) {
                        setShowClickTip(true)
                        console.log('✓ Click 提示已显示')
                    }
                }, 100)
            }
        }

        // 鼠标视差
        const mouseX = state.mouse.x
        const mouseY = state.mouse.y

        parallaxTargetRef.current.x = -mouseX * maxParallaxRef.current.x
        parallaxTargetRef.current.y = mouseY * maxParallaxRef.current.y

        parallaxCurrentRef.current.x +=
            (parallaxTargetRef.current.x - parallaxCurrentRef.current.x) * 0.08
        parallaxCurrentRef.current.y +=
            (parallaxTargetRef.current.y - parallaxCurrentRef.current.y) * 0.08

        if (groupRef.current) {
            groupRef.current.position.x = position[0] + parallaxCurrentRef.current.x
            groupRef.current.position.y = position[1] + parallaxCurrentRef.current.y
            groupRef.current.position.z = position[2] || 0
        }
    })

    return (
        <group ref={groupRef} position={position} onClick={handleClick} {...props}>
            {/* 中文文字 */}
            <Text
                ref={chineseTextRef}
                font="/fonts/CC0-OradanoMingChaoTi-2.ttf"
                fontSize={0.8}
                position={[0, 0.5, 0]}
                anchorX="center"
                anchorY="middle"
                color="#000000"
            >
                这是一个关于我奶奶的故事
            </Text>

            {/* 英文副标题 */}
            <Text
                ref={englishTextRef}
                font="/fonts/CC0-OradanoMingChaoTi-2.ttf"
                fontSize={0.4}
                position={[0, -0.3, 0]}
                anchorX="center"
                anchorY="middle"
                color="#000000"
            >
                A Story of My Grandmother
            </Text>
        </group>
    )
})

IntroText.displayName = 'IntroText'

export default IntroText


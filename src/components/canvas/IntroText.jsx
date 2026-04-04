'use client'

import { Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import useSceneStore from '@/store/sceneStore'

const IntroText = forwardRef(({ position = [0, 0, 0], ...props }, ref) => {
    const groupRef = useRef()
    const englishTextRef = useRef()
    const chineseTextRef = useRef()
    const { gl } = useThree()
    const { setSceneState, setShowClickTip, setWhiteScreenOpacity } = useSceneStore()

    const [hasClicked, setHasClicked] = useState(false)
    const [dissolve, setDissolve] = useState(0)
    const textureLoadedRef = useRef(false)
    const uniformsRefMap = useRef(new Map())

    // 鼠标视差
    const parallaxTargetRef = useRef({ x: 0, y: 0 })
    const parallaxCurrentRef = useRef({ x: 0, y: 0 })
    const maxParallaxRef = useRef({ x: 0.3, y: 0.3 })

    useImperativeHandle(ref, () => groupRef.current)

    // 加载纹理并应用到材质
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader()

        textureLoader.load(
            '/noise2.png',
            (texture) => {
                // 成功加载 noise2.png
                applyNoiseShadersToTexts(texture)
                textureLoadedRef.current = true

                // 启动入场动画（英文 + 中文时差）
                setTimeout(() => {
                    startEntranceAnimation()
                }, 200)

                console.log('✓ noise2.png 加载成功，已应用到文字材质')
            },
            undefined,
            (error) => {
                console.error('noise2.png 加载失败:', error)
                // 如果加载失败，生成程序化噪声
                const generatedTexture = generateNoiseTexture()
                applyNoiseShadersToTexts(generatedTexture)
                textureLoadedRef.current = true

                setTimeout(() => {
                    startEntranceAnimation()
                }, 200)
            }
        )

        function applyNoiseShadersToTexts(noiseTexture) {
            const applyShaderToText = (textRef, textKey) => {
                if (!textRef.current || !textRef.current.material) return

                const material = textRef.current.material
                const originalOnBeforeCompile = material.onBeforeCompile

                material.onBeforeCompile = (shader) => {
                    if (originalOnBeforeCompile) {
                        originalOnBeforeCompile(shader)
                    }

                    // 注入 uniform
                    shader.uniforms.u_noiseTex = { value: noiseTexture }
                    shader.uniforms.u_dissolve = { value: 0 }

                    // 修改 fragment shader - 使用 discard 实现消散
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <output_fragment>',
                        `
            // 噪点消散效果
            vec3 noiseColor = texture2D(u_noiseTex, vUv).rgb;
            float noiseValue = noiseColor.r;
            
            // 当 noise.r < u_dissolve 时 discard
            if (noiseValue < u_dissolve) {
                discard;
            }
            
            #include <output_fragment>
                        `
                    )

                    // 保存 uniform 引用以便后续更新
                    uniformsRefMap.current.set(textKey, shader.uniforms)
                }

                material.transparent = true
                material.needsUpdate = true
            }

            applyShaderToText(englishTextRef, 'english')
            applyShaderToText(chineseTextRef, 'chinese')
        }

        return () => {
            const refCopy = new Map(uniformsRefMap.current)
            refCopy.clear()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 生成程序化噪声纹理
    function generateNoiseTexture() {
        const width = 256
        const height = 256
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

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

    // 入场动画：初始完全不可见，依次淡入
    function startEntranceAnimation() {
        if (englishTextRef.current && englishTextRef.current.material) {
            englishTextRef.current.material.opacity = 0
        }
        if (chineseTextRef.current && chineseTextRef.current.material) {
            chineseTextRef.current.material.opacity = 0
        }
        const timeline = gsap.timeline()
        // 英文先淡入
        timeline.to(englishTextRef.current.material, {
            opacity: 1,
            duration: 1.5,
            ease: 'power2.inOut',
        }, 0)
        // 中文后淡入
        timeline.to(chineseTextRef.current.material, {
            opacity: 1,
            duration: 1.5,
            ease: 'power2.inOut',
        }, 1.0)
        // 完成后显示点击提示
        timeline.add(() => {
            if (!hasClicked) {
                setShowClickTip(true)
            }
        })
    }

    // 点击处理：触发消散动画
    const handleClick = () => {
        if (hasClicked) return

        setHasClicked(true)
        setShowClickTip(false)

        console.log('✓ 文字被点击，触发消散动画')

        const timeline = gsap.timeline()
        const dissolveObj = { value: 0 }

        // 噪点消散动画（3 秒）
        timeline.to(
            dissolveObj,
            {
                value: 1.0,
                duration: 3.0,
                ease: 'power2.inOut',
                onUpdate() {
                    setDissolve(dissolveObj.value)
                    // 更新两个文字的 u_dissolve uniform
                    uniformsRefMap.current.forEach((uniforms) => {
                        if (uniforms.u_dissolve) {
                            uniforms.u_dissolve.value = dissolveObj.value
                        }
                    })
                },
            },
            0
        )

        // 白屏闪烁（从 progress 1.5s 开始）
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

    // 每帧更新：鼠标视差
    useFrame((state) => {
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
            {/* 英文副标题 - 先出现 */}
            <Text
                ref={englishTextRef}
                font="/fonts/ZiYueYingYinSong-2.ttf"
                fontSize={0.4}
                position={[0, 0.5, 0]}
                anchorX="center"
                anchorY="middle"
                color="#000000"
                opacity={0}
            >
                A Story of My Grandmother
            </Text>

            {/* 中文主标题 - 延迟出现 */}
            <Text
                ref={chineseTextRef}
                font="/fonts/ZiYueYingYinSong-2.ttf"
                fontSize={0.8}
                position={[0, -0.5, 0]}
                anchorX="center"
                anchorY="middle"
                color="#000000"
                opacity={0}
            >
                这是一个关于我奶奶的故事
            </Text>
        </group>
    )
})

IntroText.displayName = 'IntroText'

export default IntroText


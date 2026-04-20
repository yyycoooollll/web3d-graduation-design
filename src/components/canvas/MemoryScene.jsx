'use client'

import * as THREE from 'three'
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import useSceneStore from '@/store/sceneStore'
import { getProject } from '@theatre/core'
import { editable as e, SheetProvider } from '@theatre/r3f'

const EditableCamera = e(PerspectiveCamera, 'perspectiveCamera')

/**
 * MemoryScene 组件
 * 在纯黑背景下展示高精度场景，使用高对比度梯度图实现黑白三渲二效果
 * 集成 Theatre.js 进行可视化调试和实时参数编辑
 */

// 获取或创建 Theatre Project 和 Sheet
const project = getProject('MemoryProject')
const demoSheet = project.sheet('Scene')

function MemorySceneContent() {
    const { scene } = useThree()
    const groupRef = useRef()
    const materialRefs = useRef([])
    const gradientMapRef = useRef(null)
    const [sceneReady, setSceneReady] = useState(false)
    const bgColorRef = useRef(new THREE.Color(1, 1, 1))
    const targetBgRef = useRef(new THREE.Color(0, 0, 0))

    const { sceneState } = useSceneStore()
    const { scene: loadedScene } = useGLTF('/scenes1.glb')

    // 生成高对比度梯度图 - 黑白三渲二效果
    const createGradientMap = () => {
        // ✅ 创建强对比的梯度图：暗部(20) → 灰部(100) → 亮部(255)
        const data = new Uint8Array([
            20, 20, 20,       // 暗部：深黑
            100, 100, 100,    // 灰部：中灰
            255, 255, 255,    // 亮部：纯白
        ])
        const texture = new THREE.DataTexture(
            data,
            3, // 宽度
            1, // 高度
            THREE.RGBFormat,
            THREE.UnsignedByteType
        )
        texture.magFilter = THREE.NearestFilter
        texture.minFilter = THREE.NearestFilter
        texture.needsUpdate = true
        console.log('✓ 高对比度梯度图已生成：暗[20] → 灰[100] → 亮[255]')
        return texture
    }

    // 初始化场景：替换所有 Mesh 的材质为 MeshToonMaterial
    useEffect(() => {
        // 只在状态为 'memory' 且模型加载时初始化
        if (sceneState !== 'memory' || !loadedScene || sceneReady) {
            return
        }

        console.log('✓ 初始化 MemoryScene...')

        // 清空之前的材质引用
        materialRefs.current.forEach(mat => mat.dispose())
        materialRefs.current = []

        // 生成 gradient map 并存到 ref（供 JSX 中的测试立方体使用）
        const gradientMap = createGradientMap()
        gradientMapRef.current = gradientMap

        // 克隆加载的场景
        const clonedScene = loadedScene.clone()

        // 遍历所有子对象，替换 Mesh 材质为 MeshToonMaterial，保留颜色
        clonedScene.traverse(child => {
            if (child.isMesh && child.geometry) {
                // ✅ 极度关键：强制重新计算顶点法线！
                child.geometry.computeVertexNormals()
                console.log(`  ✓ 重新计算法线: ${child.name || 'unnamed'}`)

                // ✅ 降低基础明度，防过曝，使用 #e0e0e0
                const baseColor = new THREE.Color('#e0e0e0')
                const originalMap = child.material?.map || null

                // 创建 MeshToonMaterial，使用强对比梯度图实现黑白三渲二
                const toonMaterial = new THREE.MeshToonMaterial({
                    color: baseColor,
                    map: originalMap,
                    gradientMap: gradientMap,
                    flatShading: false,
                    toneMapped: true,
                })

                child.material = toonMaterial
                materialRefs.current.push(toonMaterial)
                console.log(`  ✓ 应用 MeshToonMaterial + gradientMap: ${child.name || 'unnamed'}`)

                // 设置投影和接收阴影
                child.castShadow = true
                child.receiveShadow = true

                console.log(`  ✓ 转换 Mesh: ${child.name || 'unnamed'}, 颜色=#${baseColor.getHexString()}, 顶点数=${child.geometry.attributes.position?.count || 0}`)
            }
        })

        // 添加到 groupRef
        if (groupRef.current) {
            groupRef.current.clear()
            groupRef.current.add(clonedScene)
            console.log('✓ 模型已添加到场景')
        }

        setSceneReady(true)
        console.log('✓ MemoryScene 初始化完成')

        // 触发背景渐变动画
        gsap.to(targetBgRef.current, {
            r: 0,
            g: 0,
            b: 0,
            duration: 2.5,
            ease: 'power2.inOut',
            onUpdate() {
                bgColorRef.current.lerpColors(
                    new THREE.Color(1, 1, 1),
                    targetBgRef.current,
                    2.5 * 0.4 // 已执行的时间比例
                )
            },
        })
    }, [sceneState, loadedScene, sceneReady])

    // 清理资源
    useEffect(() => {
        return () => {
            materialRefs.current.forEach(mat => mat.dispose())
            // helpers 会随 groupRef 自动清理
        }
    }, [])

    // 每帧更新
    useFrame((state, delta) => {
        if (!sceneReady || sceneState !== 'memory') return

        // 更新背景色
        scene.background.lerp(targetBgRef.current, 0.05)
    })

    return (
        <>
            {sceneState === 'memory' && (
                <>
                    {/* ✅ Theatre.js 可编摄像机接管 */}
                    <EditableCamera
                        theatreKey="Camera"
                        makeDefault
                        position={[0, 5, 15]}
                        fov={45}
                        near={0.1}
                    />

                    {/* ✅ Theatre.js 可控灯光系统 - 强烈的黑白三渲二 */}
                    {/* 极低的环境光：环境越黑，阴影越纯 */}
                    <e.ambientLight
                        theatreKey="EnvLight"
                        intensity={0.05}
                        color={0xffffff}
                    />

                    {/* 强化主光源：从侧上方俯冲照射，产生巨大投影 */}
                    <e.directionalLight
                        theatreKey="MainLight"
                        position={[15, 20, 15]}
                        intensity={5}
                        castShadow
                        shadow-mapSize-width={4096}
                        shadow-mapSize-height={4096}
                        shadow-camera-far={150}
                        shadow-camera-left={-40}
                        shadow-camera-right={40}
                        shadow-camera-top={40}
                        shadow-camera-bottom={-40}
                    />

                    {/* 用户交互控制 - 已注释，避免与 Theatre.js 摄像机控制冲突 */}
                    {/* <OrbitControls
                        enableDamping={true}
                        dampingFactor={0.05}
                        autoRotate={false}
                    /> */}

                    {/* 场景容器（包含裁剪和缩放后的模型） */}
                    <e.group
                        theatreKey="MainModel"
                        ref={groupRef}
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        scale={[0.5, 0.5, 0.5]}
                    />
                </>
            )}
        </>
    )
}

// 导出组件
const MemoryScene = () => {
    const { sceneState } = useSceneStore()

    if (sceneState !== 'memory') {
        return null
    }

    return (
        <SheetProvider sheet={demoSheet}>
            <MemorySceneContent />
        </SheetProvider>
    )
}

// 预加载
useGLTF.preload('/scenes1.glb')

export default MemoryScene

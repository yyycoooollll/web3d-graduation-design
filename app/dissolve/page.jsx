'use client'

import { Canvas } from '@react-three/fiber'
import DissolveMap from '@/components/canvas/DissolveMap'
import { useRef, useEffect } from 'react'

// Theatre.js 初始化（仅客户端）
if (typeof window !== 'undefined') {
    const initializeTheatre = async () => {
        const studio = await import('@theatre/studio').then(m => m.default)
        const extension = await import('@theatre/r3f/dist/extension').then(m => m.default)

        studio.extend(extension)
        studio.initialize()
        console.log('✓ Theatre.js Studio 已初始化')
    }

    // 异步初始化 studio
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTheatre)
    } else {
        initializeTheatre().catch(console.error)
    }
}

export default function DissolveMapPage() {
    const canvasRef = useRef()

    useEffect(() => {
        console.log('✓ DissolveMapPage 已挂载，Theatre.js 已准备就绪')
    }, [])

    return (
        <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, background: '#ffffff' }}>
            {/* Canvas 容器 */}
            <div style={{ width: '100%', height: '100%' }}>
                <Canvas
                    camera={{ position: [0, 0, 10], fov: 45 }}
                    gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
                >
                    <color attach="background" args={['#ffffff']} />
                    <DissolveMap ref={canvasRef} />
                </Canvas>
            </div>

            {/* 使用说明 - 隐藏 */}
            <div
                style={{
                    display: 'none',
                    position: 'fixed',
                    top: 20,
                    left: 20,
                    color: '#333',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '20px',
                    borderRadius: '8px',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    maxWidth: '320px',
                    zIndex: 10,
                    lineHeight: '1.8',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: '1px solid #ccc',
                }}
            >
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    🌊 不规则溶解效果
                </h3>
                <p style={{ margin: '0 0 10px 0' }}>
                    <strong>操作说明：</strong>
                </p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li style={{ margin: '5px 0' }}>📜 <strong>向下滚轮</strong> - 增加溶解效果</li>
                    <li style={{ margin: '5px 0' }}>📜 <strong>向上滚轮</strong> - 减少溶解效果</li>
                </ul>
                <p style={{ margin: '15px 0 0 0', fontSize: '12px', color: '#aaa' }}>
                    使用噪声纹理创建的不规则溶解动画
                </p>
            </div>

            {/* 底部信息 - 隐藏 */}
            <div
                style={{
                    display: 'none',
                    position: 'fixed',
                    bottom: 20,
                    left: 20,
                    color: '#999',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                }}
            >
                <p style={{ margin: '0' }}>Three.js + React Three Fiber</p>
                <p style={{ margin: '5px 0 0 0' }}>WebGL Dissolve Effect</p>
            </div>
        </div>
    )
}

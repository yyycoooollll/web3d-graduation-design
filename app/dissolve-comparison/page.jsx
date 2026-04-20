'use client'

import { Canvas } from '@react-three/fiber'
import DissolveMap from '@/components/canvas/DissolveMap'
import DissolveMapAdvanced from '@/components/canvas/DissolveMapAdvanced'
import { useRef, useState } from 'react'

export default function DissolveComparisonPage() {
    const basicCanvasRef = useRef()
    const advancedCanvasRef = useRef()
    const [selectedMode, setSelectedMode] = useState('advanced')

    return (
        <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, background: '#ffffff' }}>
            {/* 双视图容器 */}
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                {/* 左侧：基础版本 */}
                <div style={{ flex: 1, position: 'relative', borderRight: '2px solid #ccc' }}>
                    <Canvas
                        camera={{ position: [0, 0, 10], fov: 45 }}
                        gl={{ alpha: true, antialias: true }}
                    >
                        <color attach="background" args={['#ffffff']} />
                        <DissolveMap ref={basicCanvasRef} />
                    </Canvas>

                    <div
                        style={{
                            display: 'none',
                            position: 'absolute',
                            top: 15,
                            left: 15,
                            color: '#333',
                            fontSize: '12px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            border: '1px solid #ccc'
                        }}
                    >
                        基础版本
                    </div>
                </div>

                {/* 右侧：高级版本 */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <Canvas
                        camera={{ position: [0, 0, 10], fov: 45 }}
                        gl={{ alpha: true, antialias: true }}
                    >
                        <color attach="background" args={['#ffffff']} />
                        <DissolveMapAdvanced ref={advancedCanvasRef} />
                    </Canvas>

                    <div
                        style={{
                            display: 'none',
                            position: 'absolute',
                            top: 15,
                            left: 15,
                            color: '#333',
                            fontSize: '12px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            border: '1px solid #ccc'
                        }}
                    >
                        高级版本 (FBM)
                    </div>
                </div>
            </div>

            {/* 控制面板 - 隐藏 */}
            <div
                style={{
                    display: 'none',
                    position: 'fixed',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#333',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '20px 30px',
                    borderRadius: '8px',
                    zIndex: 10,
                    textAlign: 'center',
                    border: '1px solid #ccc',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
            >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                    🎛️ 不规则溶解效果演示
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666' }}>
                    📜 使用鼠标滚轮在两个版本中控制溶解效果
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <a
                        href="/dissolve"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    >
                        基础版本详情
                    </a>
                    <a
                        href="/dissolve-advanced"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    >
                        高级版本详情
                    </a>
                </div>
            </div>

            {/* 说明 - 隐藏 */}
            <div
                style={{
                    display: 'none',
                    position: 'fixed',
                    top: 20,
                    left: 20,
                    color: '#333',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '15px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    maxWidth: '280px',
                    lineHeight: '1.6',
                    border: '1px solid #ccc',
                    zIndex: 10
                }}
            >
                <h4 style={{ margin: '0 0 8px 0' }}>✨ 功能说明</h4>
                <div style={{ fontSize: '10px', color: '#666' }}>
                    <p style={{ margin: '4px 0' }}>
                        <strong>基础版本：</strong>简单噪声溶解
                    </p>
                    <p style={{ margin: '4px 0' }}>
                        <strong>高级版本：</strong>分形布朗运动(FBM)
                    </p>
                    <p style={{ margin: '8px 0 0 0', color: '#999' }}>
                        右下角查看完整使用说明
                    </p>
                </div>
            </div>

            {/* 技术信息 - 隐藏 */}
            <div
                style={{
                    display: 'none',
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    color: '#999',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    textAlign: 'right',
                    maxWidth: '200px',
                    lineHeight: '1.5'
                }}
            >
                <p style={{ margin: '0' }}>Three.js WebGL</p>
                <p style={{ margin: '3px 0 0 0' }}>React Three Fiber</p>
                <p style={{ margin: '3px 0 0 0' }}>GLSL Shader</p>
            </div>
        </div>
    )
}

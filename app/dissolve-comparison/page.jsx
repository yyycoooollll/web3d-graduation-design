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
        <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, background: '#000' }}>
            {/* 双视图容器 */}
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                {/* 左侧：基础版本 */}
                <div style={{ flex: 1, position: 'relative', borderRight: '2px solid #333' }}>
                    <Canvas
                        camera={{ position: [0, 0, 10], fov: 45 }}
                        gl={{ alpha: true, antialias: true }}
                    >
                        <color attach="background" args={['#0a0a0a']} />
                        <DissolveMap ref={basicCanvasRef} />
                    </Canvas>

                    <div
                        style={{
                            position: 'absolute',
                            top: 15,
                            left: 15,
                            color: '#fff',
                            fontSize: '12px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
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
                        <color attach="background" args={['#0a0a0a']} />
                        <DissolveMapAdvanced ref={advancedCanvasRef} />
                    </Canvas>

                    <div
                        style={{
                            position: 'absolute',
                            top: 15,
                            left: 15,
                            color: '#fff',
                            fontSize: '12px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                        }}
                    >
                        高级版本 (FBM)
                    </div>
                </div>
            </div>

            {/* 控制面板 */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: '20px 30px',
                    borderRadius: '8px',
                    zIndex: 10,
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
                }}
            >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                    🎛️ 不规则溶解效果演示
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#aaa' }}>
                    📜 使用鼠标滚轮在两个版本中控制溶解效果
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <a
                        href="/dissolve"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#444',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            border: '1px solid #555',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#555'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#444'}
                    >
                        基础版本详情
                    </a>
                    <a
                        href="/dissolve-advanced"
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#444',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            border: '1px solid #555',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#555'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#444'}
                    >
                        高级版本详情
                    </a>
                </div>
            </div>

            {/* 说明 */}
            <div
                style={{
                    position: 'fixed',
                    top: 20,
                    left: 20,
                    color: '#fff',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: '15px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    maxWidth: '280px',
                    lineHeight: '1.6',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    zIndex: 10
                }}
            >
                <h4 style={{ margin: '0 0 8px 0' }}>✨ 功能说明</h4>
                <div style={{ fontSize: '10px', color: '#aaa' }}>
                    <p style={{ margin: '4px 0' }}>
                        <strong>基础版本：</strong>简单噪声溶解
                    </p>
                    <p style={{ margin: '4px 0' }}>
                        <strong>高级版本：</strong>分形布朗运动(FBM)
                    </p>
                    <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                        右下角查看完整使用说明
                    </p>
                </div>
            </div>

            {/* 技术信息 */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    color: '#666',
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

'use client'

import { Canvas } from '@react-three/fiber'
import DissolveMapAdvanced from '@/components/canvas/DissolveMapAdvanced'
import { useRef } from 'react'

export default function DissolveMapAdvancedPage() {
    const canvasRef = useRef()

    return (
        <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, background: '#ffffff' }}>
            {/* Canvas 容器 */}
            <div style={{ width: '100%', height: '100%' }}>
                <Canvas
                    camera={{ position: [0, 0, 10], fov: 45 }}
                    gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
                >
                    <color attach="background" args={['#ffffff']} />
                    <DissolveMapAdvanced ref={canvasRef} />
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
                    maxWidth: '340px',
                    zIndex: 10,
                    lineHeight: '1.8',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid #ccc',
                }}
            >
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                    ✨ 高级溶解效果
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>
                    <strong>操作说明：</strong>
                </p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li style={{ margin: '5px 0', fontSize: '13px' }}>📜 <strong>向下滚轮</strong> - 增加溶解效果</li>
                    <li style={{ margin: '5px 0', fontSize: '13px' }}>📜 <strong>向上滚轮</strong> - 减少溶解效果</li>
                </ul>
                <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#999' }}>
                    分形布朗运动 (FBM) 噪声<br />
                    创建自然的不规则溶解动画
                </p>
            </div>

            {/* 底部信息 */}
            <div
                style={{
                    display: 'none', position: 'fixed',
                    bottom: 20,
                    left: 20,
                    color: '#999',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                }}
            >
                <p style={{ margin: '0' }}>Three.js + React Three Fiber</p>
                <p style={{ margin: '5px 0 0 0' }}>WebGL Advanced Dissolve Effect</p>
            </div>

            {/* 效果说明 - 隐藏 */}
            <div
                style={{
                    display: 'none',
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    color: '#999',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    textAlign: 'right',
                    maxWidth: '200px',
                }}
            >
                <p style={{ margin: '0' }}>多层分形噪声</p>
                <p style={{ margin: '5px 0 0 0' }}>平滑溶解边界</p>
            </div>
        </div>
    )
}

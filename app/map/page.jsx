'use client'

import { Canvas } from '@react-three/fiber'
import { MapEffect } from '@/components/canvas/MapEffect'

export default function MapPage() {
  return (
    <div style={{ width: '100%', margin: 0, padding: 0, background: '#ffffff' }}>
      {/* Canvas 容器 - 固定位置，初始白色背景 */}
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true }}
        >
          <color attach="background" args={['#ffffff']} />
          <MapEffect />
        </Canvas>
      </div>

      {/* 用于触发滚动的空白区域 */}
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '300vh', // 3倍屏幕高度，足够触发滚动
        pointerEvents: 'none' // 不阻止鼠标事件
      }}>
      </div>

      {/* 使用说明 */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          color: '#333',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          maxWidth: '320px',
          zIndex: 999,
          lineHeight: '1.6',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', color: '#000' }}>✨ 沉浸式地图</h3>
        <p>
          <strong>📜 向下滚动：</strong> 地图消散、雾气降临
        </p>
        <p>
          <strong>📜 向上滚动：</strong> 地图恢复清晰
        </p>
        <p>
          <strong>🎯 移动鼠标：</strong> 地图跟随移动
        </p>
        <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.7 }}>
          <em>💡 开场白色，地图逐渐浮现；灰尘漂浮其中</em>
        </p>
      </div>
    </div>
  )
}

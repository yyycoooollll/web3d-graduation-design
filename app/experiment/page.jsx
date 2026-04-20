'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function ExperimentPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef(null)
  const ppl1Ref = useRef(null)

  // 鼠标移动事件 - 检测是否悬停在 ppl1 上
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })

      // 检测鼠标是否在 ppl1 上
      if (ppl1Ref.current) {
        const rect = ppl1Ref.current.getBoundingClientRect()
        const isOver =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        setIsHovered(isOver)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 滚轮事件 - 驱动左右摆动走路动画
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      // 根据滚轮方向和幅度累积进度
      const delta = e.deltaY > 0 ? 1 : -1
      setScrollProgress((prev) => {
        const newProgress = prev + delta * 0.02
        // 限制在 0 到 1 之间
        return Math.max(0, Math.min(1, newProgress))
      })
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  // 计算人物的位置随滚轮进度从左到右移动
  const ppl1X = scrollProgress * 60 - 30 // -30% 到 +30%
  
  // 计算走路摇晃动画（左右摆动）
  const swayAngle = Math.sin(scrollProgress * Math.PI * 4) * 8 // 左右摇晃 ±8 度

  // 计算悬停时的缩放
  const hoverScale = isHovered ? 1.15 : 1

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* 背景 - Trees 固定在顶层 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src="/trees.png"
            alt="trees"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </div>

      {/* 人物 - ppl1 在后面，支持滚轮驱动和悬停效果 */}
      <div
        ref={ppl1Ref}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: `calc(50% + ${ppl1X}%)`,
          transform: `translateX(-50%) rotate(${swayAngle}deg) scale(${hoverScale})`,
          transition: isHovered ? 'transform 0.2s ease-out' : 'transform 0.3s ease-out',
          zIndex: 20,
          cursor: isHovered ? 'pointer' : 'default',
        }}
      >
        <div style={{ position: 'relative', width: 180, height: 280 }}>
          <Image
            src="/ppl1.png"
            alt="ppl1"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>

      {/* 提示文本 */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          fontSize: 12,
          color: '#666',
          zIndex: 100,
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.6,
        }}
      >
        <p>🖱️ 鼠标靠近人物：缩放效果</p>
        <p>🎡 鼠标滚轮：左右走路动画</p>
        <p>Progress: {(scrollProgress * 100).toFixed(1)}%</p>
      </div>
    </div>
  )
}

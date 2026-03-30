'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import useSceneStore from '@/store/sceneStore'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

const Layout = ({ children }) => {
  const ref = useRef()
  const { showClickTip, whiteScreenOpacity } = useSceneStore()

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        touchAction: 'auto',
      }}
    >
      {children}
      <Scene
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
        eventSource={ref}
        eventPrefix='client'
      />

      {/* Click 提示 */}
      {showClickTip && (
        <div
          style={{
            position: 'fixed',
            bottom: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            color: '#666',
            opacity: 1,
            transition: 'opacity 0.6s ease-in-out',
            cursor: 'pointer',
            letterSpacing: '2px',
            fontWeight: 300,
            zIndex: 100,
            pointerEvents: 'auto',
          }}
        >
          Click to continue
        </div>
      )}

      {/* 白屏转场 */}
      {whiteScreenOpacity > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            opacity: whiteScreenOpacity,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      )}
    </div>
  )
}

export { Layout }

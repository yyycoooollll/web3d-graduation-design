'use client'

import { useEffect, useState } from 'react'
import AIRawScene from '@/components/airaw/AIRawScene'
import useSceneStore from '@/store/sceneStore'
import styles from './page.module.css'

export default function Page() {
  const [animationStage, setAnimationStage] = useState('map')
  const { setOnMapDissolveComplete, sceneState } = useSceneStore()

  useEffect(() => {
    setOnMapDissolveComplete(() => setAnimationStage('ai_effect'))
    return () => {
      setOnMapDissolveComplete(null)
    }
  }, [setOnMapDissolveComplete])

  useEffect(() => {
    if (sceneState === 'ai_effect') {
      setAnimationStage('ai_effect')
    }
  }, [sceneState])

  return (
    <div className={styles.root}>
      {animationStage === 'ai_effect' && (
        <div className={styles.aiOverlay}>
          <AIRawScene />
        </div>
      )}
    </div>
  )
}

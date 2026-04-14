'use client'

import { useEffect, useState } from 'react'
import useSceneStore from '@/store/sceneStore'

const defaultControls = {
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    elevation: 2,
    azimuth: 180,
    exposure: 0.5,
    cloudCoverage: 0.5,
    cloudDensity: 0.5,
    cloudElevation: 0.3,
}

export default function SkyGuiPanel() {
    const { sceneState } = useSceneStore()
    const [effectController, setEffectController] = useState(defaultControls)

    // 仅在 Preface 场景中显示
    const isVisible = sceneState === 'preface_start' || sceneState === 'preface_active'

    if (!isVisible) {
        return null
    }

    const handleControlChange = (key, value) => {
        setEffectController(prev => ({
            ...prev,
            [key]: value,
        }))

        // 发送参数到父组件（通过 window 对象或 custom event）
        window.dispatchEvent(
            new CustomEvent('skyControlChange', {
                detail: { key, value, controller: { ...effectController, [key]: value } },
            })
        )
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                backgroundColor: 'rgba(50, 50, 50, 0.9)',
                color: '#fff',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'Courier, monospace',
                fontSize: '12px',
                maxWidth: '280px',
                maxHeight: '70vh',
                overflowY: 'auto',
                border: '1px solid #666',
                zIndex: 1000,
                pointerEvents: 'auto',
            }}
        >
            <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '14px' }}>
                ☀️ Interactive Sky Controls
            </div>

            {/* Sun Parameters */}
            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Elevation: {effectController.elevation.toFixed(1)}°
                </label>
                <input
                    type='range'
                    min='0'
                    max='90'
                    step='1'
                    value={effectController.elevation}
                    onChange={e => handleControlChange('elevation', parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Azimuth: {effectController.azimuth.toFixed(1)}°
                </label>
                <input
                    type='range'
                    min='-180'
                    max='180'
                    step='1'
                    value={effectController.azimuth}
                    onChange={e => handleControlChange('azimuth', parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            {/* Atmosphere Parameters */}
            <div style={{ marginBottom: '12px', borderTop: '1px solid #555', paddingTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Turbidity: {effectController.turbidity.toFixed(2)}
                </label>
                <input
                    type='range'
                    min='0'
                    max='20'
                    step='0.1'
                    value={effectController.turbidity}
                    onChange={e => handleControlChange('turbidity', parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Rayleigh: {effectController.rayleigh.toFixed(2)}
                </label>
                <input
                    type='range'
                    min='0'
                    max='5'
                    step='0.1'
                    value={effectController.rayleigh}
                    onChange={e => handleControlChange('rayleigh', parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Mie Coefficient: {effectController.mieCoefficient.toFixed(4)}
                </label>
                <input
                    type='range'
                    min='0'
                    max='0.1'
                    step='0.001'
                    value={effectController.mieCoefficient}
                    onChange={e => handleControlChange('mieCoefficient', parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Mie Directional: {effectController.mieDirectionalG.toFixed(2)}
                </label>
                <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.01'
                    value={effectController.mieDirectionalG}
                    onChange={e => handleControlChange('mieDirectionalG', parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            {/* Cloud Parameters */}
            <div style={{ marginBottom: '12px', borderTop: '1px solid #555', paddingTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Cloud Coverage: {effectController.cloudCoverage.toFixed(2)}
                </label>
                <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.05'
                    value={effectController.cloudCoverage}
                    onChange={e => handleControlChange('cloudCoverage', parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            {/* Reset Button */}
            <button
                onClick={() => setEffectController(defaultControls)}
                style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                }}
            >
                Reset
            </button>
        </div>
    )
}

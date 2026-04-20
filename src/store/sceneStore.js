import { create } from 'zustand'

const useSceneStore = create((set) => ({
    sceneState: 'intro',
    showClickTip: false,
    whiteScreenOpacity: 0,
    bgColor: '#ffffff',
    cameraProgress: 0,
    onMapDissolveComplete: null,

    setSceneState: (state) => set({ sceneState: state }),
    setShowClickTip: (show) => set({ showClickTip: show }),
    setWhiteScreenOpacity: (opacity) => set({ whiteScreenOpacity: opacity }),
    setBgColor: (color) => set({ bgColor: color }),
    setCameraProgress: (progress) => set({ cameraProgress: progress }),
    setOnMapDissolveComplete: (handler) => set({ onMapDissolveComplete: handler }),
}))

export default useSceneStore

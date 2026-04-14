import { create } from 'zustand'

const useSceneStore = create((set) => ({
    sceneState: 'intro', // 'intro' | 'map' | 'preface_start' | 'preface_active' | 'preface_complete'
    showClickTip: false,
    whiteScreenOpacity: 0,
    backgroundOpacity: 1, // 背景透明度控制 (白到黑)

    setSceneState: (state) => set({ sceneState: state }),
    setShowClickTip: (show) => set({ showClickTip: show }),
    setWhiteScreenOpacity: (opacity) => set({ whiteScreenOpacity: opacity }),
    setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),
}))

export default useSceneStore

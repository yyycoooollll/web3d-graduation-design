import { create } from 'zustand'

const useSceneStore = create((set) => ({
    sceneState: 'intro',
    showClickTip: false,
    whiteScreenOpacity: 0,

    setSceneState: (state) => set({ sceneState: state }),
    setShowClickTip: (show) => set({ showClickTip: show }),
    setWhiteScreenOpacity: (opacity) => set({ whiteScreenOpacity: opacity }),
}))

export default useSceneStore

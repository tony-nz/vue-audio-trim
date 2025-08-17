import { ref } from "vue";

// Stub file - not used in current implementation
export function useAudioCache() {
  return {
    isExporting: ref(false),
    isRendering: ref(false),
    renderProgress: ref(0),
    exportAudio: () => {},
    renderInBackground: () => {},
    clearCache: () => {},
    initializeAudio: () => {}
  };
}
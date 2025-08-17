import { ref } from "vue";

// Stub file - not used in current implementation  
export function useAudioExportFast() {
  return {
    exportFormat: ref("mp3"),
    isExporting: ref(false),
    exportAudio: () => {},
  };
}
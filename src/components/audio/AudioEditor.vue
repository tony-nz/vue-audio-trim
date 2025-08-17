<template>
  <div class="w-full">
    <div class="rounded-lg shadow-2xl w-full">
      <!-- Header Controls -->
      <AudioEditorHeader
        :actions="actions"
        :selected-action="selectedAction"
        :title="editableTitle"
        @select-action="selectAction"
        @update-title="(newTitle: string) => editableTitle = newTitle"
        @open-fade-settings="openFadeSettings"
        @reset="resetAll"
        @close="showCloseAudioDialog"
      />

      <!-- Main Player Area -->
      <div class="p-6 relative">
        <!-- Waveform Area -->
        <AudioEditorWaveform
          :region="region"
          :cursor-position="cursorPosition"
          :cursor-time="cursorTime"
          :current-time="currentTime"
          :wavesurfer="wavesurfer"
          :is-loading="isLoading"
          @format-time="formatTime"
        />

        <!-- Settings Overlay -->
        <AudioEditorSettingsOverlay
          :is-open="isSettingsOpen"
          :fade-in-duration="waveSurferFadeInDuration"
          :fade-out-duration="waveSurferFadeOutDuration"
          @close="isSettingsOpen = false"
          @apply-fade-settings="applyFadeSettings"
        />

        <!-- Effects Panel -->
        <AudioEditorEffectsPanel
          v-if="selectedAction"
          :selected-action="selectedAction"
          :volume="volume"
          :exported-volume="exportedVolume"
          :speed="speed"
          :music-info="musicInfo"
          :bitrate="bitrate"
          :equalizer="equalizer"
          @update-volume="handleVolumeUpdate"
          @update-exported-volume="(v: any) => (exportedVolume = v)"
          @update-speed="(value: number) => setSpeed(wavesurfer, value)"
          @update-bitrate="(v: any) => (bitrate = v)"
          @update-equalizer="updateEqualizer"
          @reset-equalizer="resetEqualizer"
          @apply-preset="applyEqPreset"
        />

        <!-- Bottom Controls -->
        <AudioEditorControls
          :is-playing="isPlaying"
          :fade-in-enabled="fadeInEnabled"
          :fade-out-enabled="fadeOutEnabled"
          :is-trim-mode="isTrimMode"
          :region="region"
          :export-format="exportFormat"
          :is-exporting="isExporting"
          @play-pause="handlePlayPause"
          @stop="handleStop"
          @toggle-fade-in="handleToggleFadeIn"
          @toggle-fade-out="handleToggleFadeOut"
          @toggle-trim-mode="toggleTrimMode"
          @adjust-start-time="adjustStartTime"
          @adjust-end-time="adjustEndTime"
          @set-start-time="setStartTime"
          @set-end-time="setEndTime"
          @export="handleExport"
          @update-export-format="(v: any) => (exportFormat = v)"
        />
      </div>
    </div>

    <!-- Dialogs -->
    <AudioEditorDialogs
      :dialog="dialog"
      :is-tempo-loading="isTempoLoading"
      @close="dialog.close"
      @confirm-close="$emit('close')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useWaveSurfer } from "../../composables/audio/useWaveSurfer";
import { useAudioEffects } from "../../composables/audio/useAudioEffects";
import { useInstantExport } from "../../composables/audio/useInstantExport";
import { useEnvelope } from "../../composables/audio/useEnvelope";
import { useMusicTempo } from "../../composables/audio/useMusicTempo";
import { formatTime, handleKeyPress } from "../../utils/audioUtils";
import useDialog from "../../composables/common/useDialog";

import AudioEditorHeader from "./AudioEditorHeader.vue";
import AudioEditorWaveform from "./AudioEditorWaveform.vue";
import AudioEditorEffectsPanel from "./AudioEditorEffectsPanel.vue";
import AudioEditorControls from "./AudioEditorControls.vue";
import AudioEditorDialogs from "./AudioEditorDialogs.vue";
import AudioEditorSettingsOverlay from "./AudioEditorSettingsOverlay.vue";

interface Props {
  rawAudio: File;
  rawAudioDuration: number;
}

const props = defineProps<Props>();
defineEmits<{
  close: [];
}>();

// Composables
const dialog = useDialog();
const { isTempoLoading, musicInfo, decodeAndSetMusicInfo } = useMusicTempo();
const {
  envelopePlugin,
  createEnvelopePlugin,
  updateEnvelopePoints,
  getEnvelopeVolumeAtTime,
} = useEnvelope();
const { isExporting, exportAudio } = useInstantExport();
const exportFormat = ref("mp3");

const {
  wavesurfer,
  isPlaying,
  currentTime,
  cursorPosition,
  cursorTime,
  region,
  isLoading,
  handlePlayPause,
  handleStop,
  adjustStartTime,
  adjustEndTime,
  setStartTime,
  setEndTime,
  resetRegion,
  updateFadeIn,
  updateFadeOut,
  updateBaseVolume,
  fadeInDuration: waveSurferFadeInDuration,
  fadeOutDuration: waveSurferFadeOutDuration,
} = useWaveSurfer(props.rawAudio, props.rawAudioDuration);

const {
  volume,
  exportedVolume,
  setVolume,
  speed,
  setSpeed,
  bitrate,
  equalizer,
  updateEqualizer,
  resetEqualizer,
  fadeInEnabled,
  fadeInDuration,
  fadeOutEnabled,
  fadeOutDuration,
  isTrimMode,
  toggleFadeIn,
  toggleFadeOut,
  toggleTrimMode,
  resetAll: resetEffects,
} = useAudioEffects();

// Actions and selections
const actions = [
  { tooltip: "Volume", key: "volume", icon: "volume-up" },
  { tooltip: "Speed", key: "speed", icon: "tachometer-alt" },
  { tooltip: "Bitrate", key: "bitrate", icon: "wave-square" },
  { tooltip: "Equalizer", key: "equalizer", icon: "sliders-h" },
];

const selectedAction = ref("");
const editableTitle = ref("");

const selectAction = (key: string) => {
  // Toggle: if clicking the same action, deselect it
  if (selectedAction.value === key) {
    selectedAction.value = "";
  } else {
    selectedAction.value = key;
    if (key === "speed") {
      wavesurfer.value?.pause();
      dialog.open("findBPM");
      decodeAndSetMusicInfo(props.rawAudio, dialog);
    }
  }
};

const showCloseAudioDialog = () => {
  wavesurfer.value?.pause();
  dialog.open("closeConfirm");
};

const isSettingsOpen = ref(false);

const openFadeSettings = () => {
  wavesurfer.value?.pause();
  isSettingsOpen.value = true;
};

const applyFadeSettings = (
  newFadeInDuration: number,
  newFadeOutDuration: number
) => {
  // Update both composables' fade durations
  fadeInDuration.value = newFadeInDuration;
  fadeOutDuration.value = newFadeOutDuration;
  waveSurferFadeInDuration.value = newFadeInDuration;
  waveSurferFadeOutDuration.value = newFadeOutDuration;

  // Update waveform visualization
  updateFadeIn(fadeInEnabled.value, newFadeInDuration);
  updateFadeOut(fadeOutEnabled.value, newFadeOutDuration);

  // Update envelope points for export
  updateEnvelopePoints(
    wavesurfer.value,
    region.value,
    fadeInEnabled.value,
    newFadeInDuration,
    fadeOutEnabled.value,
    newFadeOutDuration
  );

  isSettingsOpen.value = false;
};

const applyEqPreset = (presetValues: number[]) => {
  presetValues.forEach((value, index) => {
    updateEqualizer(value, index);
  });
};

const handleVolumeUpdate = (v: number) => {
  setVolume(wavesurfer.value, v);
  updateBaseVolume(v / 100); // Convert percentage to decimal for WaveSurfer
};

const handleToggleFadeIn = () => {
  toggleFadeIn();
  // Update waveform visualization
  updateFadeIn(fadeInEnabled.value, fadeInDuration.value);
  // Update envelope with debounce
  debouncedUpdateEnvelope();
};

const handleToggleFadeOut = () => {
  toggleFadeOut();
  // Update waveform visualization
  updateFadeOut(fadeOutEnabled.value, fadeOutDuration.value);
  // Update envelope with debounce
  debouncedUpdateEnvelope();
};

const resetAll = () => {
  resetEffects(wavesurfer.value);
  resetRegion();
  updateEnvelopePoints(
    wavesurfer.value,
    region.value,
    fadeInEnabled.value,
    fadeInDuration.value,
    fadeOutEnabled.value,
    fadeOutDuration.value
  );
  // Reset base volume to 100%
  updateBaseVolume(1.0);
};

const handleExport = () => {
  console.log("🚀 Starting INSTANT export test...");
  exportAudio(wavesurfer.value, editableTitle.value);
};

// Debounce function for envelope updates
let envelopeUpdateTimeout: number | null = null;

const debouncedUpdateEnvelope = () => {
  if (envelopeUpdateTimeout) {
    clearTimeout(envelopeUpdateTimeout);
  }
  
  envelopeUpdateTimeout = setTimeout(() => {
    updateEnvelopePoints(
      wavesurfer.value,
      region.value,
      fadeInEnabled.value,
      fadeInDuration.value,
      fadeOutEnabled.value,
      fadeOutDuration.value
    );
    envelopeUpdateTimeout = null;
  }, 100) as unknown as number;
};

// Watch for fade changes and region updates
watch([fadeInDuration, fadeOutDuration], () => {
  // Use debounced update for envelope
  debouncedUpdateEnvelope();

  // Update waveform visualization when fade durations change
  updateFadeIn(fadeInEnabled.value, fadeInDuration.value);
  updateFadeOut(fadeOutEnabled.value, fadeOutDuration.value);
});

// Watch for region changes to update envelope points
watch(
  region,
  () => {
    // Use debounced update for envelope
    debouncedUpdateEnvelope();
  },
  { deep: true }
);

// Initialize envelope
onMounted(() => {
  createEnvelopePlugin();
  handleVolumeUpdate(100);

  // Initialize title with filename + suffix
  const baseName = props.rawAudio.name.replace(/\.[^/.]+$/, ""); // Remove extension
  editableTitle.value = `${baseName} (VueAudioTrim)`;

  const keyHandler = (event: KeyboardEvent) => {
    handleKeyPress(event, handlePlayPause, wavesurfer.value);
  };

  addEventListener("keydown", keyHandler);

  onBeforeUnmount(() => {
    // Clear any pending envelope updates
    if (envelopeUpdateTimeout) {
      clearTimeout(envelopeUpdateTimeout);
      envelopeUpdateTimeout = null;
    }
    
    removeEventListener("keydown", keyHandler);
  });
});
</script>

<style scoped>
/* Waveform styling */
#waveform :deep(wave) {
  background-color: transparent !important;
}

#waveform ::part(region-region) {
  background-color: rgba(96, 165, 250, 0.15) !important;
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

#waveform ::part(region-handle) {
  background-color: #60a5fa !important;
  width: 3px !important;
  cursor: ew-resize !important;
  top: 0 !important;
  bottom: 0 !important;
  border-radius: 0 !important;
  opacity: 1 !important;
  z-index: 10 !important;
  box-shadow: 0 0 0 8px rgba(96, 165, 250, 0.2) !important;
}

#waveform ::part(region-handle-start) {
  left: 0 !important;
  transform: translateX(-50%) !important;
}

#waveform ::part(region-handle-end) {
  right: 0 !important;
  transform: translateX(50%) !important;
}

#waveform ::part(region-handle-left) {
  border-top-left-radius: 6px !important;
  border-bottom-left-radius: 6px !important;
  border-bottom-right-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

#waveform ::part(region-handle-right) {
  border-top-right-radius: 6px !important;
  border-bottom-right-radius: 6px !important;
  border-bottom-left-radius: 0 !important;
  border-top-left-radius: 0 !important;
}

#waveform ::part(region-handle)::after {
  content: "";
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: white;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 -12px 0 white, 0 12px 0 white;
}

#waveform :deep(.wavesurfer-cursor) {
  position: relative;
}

#waveform :deep(.wavesurfer-cursor)::after {
  content: attr(data-time);
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: red;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
}

#waveform ::part(canvases),
#waveform ::part(progress) {
  display: flex;
  align-items: center;
  height: 200px;
}
</style>

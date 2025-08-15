<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="player-bg rounded-lg shadow-2xl max-w-5xl w-full">
      <!-- Header Controls -->
      <AudioEditorHeader 
        :actions="actions"
        :selected-action="selectedAction"
        @select-action="selectAction"
        @reset="resetAll"
        @close="showCloseAudioDialog"
      />

      <!-- Main Player Area -->
      <div class="p-6">
        <!-- Time display in corner -->
        <div class="relative mb-4">
          <div class="absolute top-0 left-0 bg-white text-slate-800 px-3 py-1 rounded-full text-sm font-medium">
            {{ formatTime(currentTime) }}
          </div>
        </div>

        <!-- Track Title -->
        <div class="text-center text-gray-300 text-sm mb-4 mt-8">
          {{ rawAudio?.name || "No file loaded" }}
        </div>

        <!-- Waveform Area -->
        <AudioEditorWaveform 
          :region="region"
          :cursor-position="cursorPosition"
          :cursor-time="cursorTime"
          :wavesurfer="wavesurfer"
          :is-loading="isLoading"
          @format-time="formatTime"
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
          @update-volume="setVolume"
          @update-exported-volume="(v) => exportedVolume = v"
          @update-speed="setSpeed"
          @update-bitrate="(v) => bitrate = v"
          @update-equalizer="updateEqualizer"
          @reset-equalizer="resetEqualizer"
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
          @toggle-fade-in="toggleFadeIn"
          @toggle-fade-out="toggleFadeOut"
          @toggle-trim-mode="toggleTrimMode"
          @adjust-start-time="adjustStartTime"
          @adjust-end-time="adjustEndTime"
          @export="handleExport"
          @update-export-format="(v) => exportFormat = v"
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
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useWaveSurfer } from '../../composables/audio/useWaveSurfer';
import { useAudioEffects } from '../../composables/audio/useAudioEffects';
import { useAudioExport } from '../../composables/audio/useAudioExport';
import { useEnvelope } from '../../composables/audio/useEnvelope';
import { useMusicTempo } from '../../composables/audio/useMusicTempo';
import { formatTime, handleKeyPress } from '../../utils/audioUtils';
import useDialog from '../../composables/common/useDialog';

import AudioEditorHeader from './AudioEditorHeader.vue';
import AudioEditorWaveform from './AudioEditorWaveform.vue';
import AudioEditorEffectsPanel from './AudioEditorEffectsPanel.vue';
import AudioEditorControls from './AudioEditorControls.vue';
import AudioEditorDialogs from './AudioEditorDialogs.vue';

interface Props {
  rawAudio: File;
  rawAudioDuration: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

// Composables
const dialog = useDialog();
const { isTempoLoading, musicInfo, decodeAndSetMusicInfo } = useMusicTempo();
const { envelopePlugin, createEnvelopePlugin, updateEnvelopePoints, getEnvelopeVolumeAtTime } = useEnvelope();
const { exportFormat, isExporting, exportAudio } = useAudioExport();

const {
  wavesurfer,
  regionsPlugin,
  isPlaying,
  currentTime,
  cursorPosition,
  cursorTime,
  region,
  isLoading,
  updateExportRegion,
  handlePlayPause,
  adjustStartTime,
  adjustEndTime,
  resetRegion,
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
  { tooltip: 'Volume', key: 'volume', icon: 'volume-up' },
  { tooltip: 'Speed', key: 'speed', icon: 'tachometer-alt' },
  { tooltip: 'Bitrate', key: 'bitrate', icon: 'wave-square' },
  { tooltip: 'Equalizer', key: 'equalizer', icon: 'sliders-h' },
];

const selectedAction = ref('volume');

const selectAction = (key: string) => {
  selectedAction.value = key;
  if (key === 'speed') {
    wavesurfer.value?.pause();
    dialog.open('findBPM');
    decodeAndSetMusicInfo(props.rawAudio, dialog);
  }
};

const showCloseAudioDialog = () => {
  wavesurfer.value?.pause();
  dialog.open('closeConfirm');
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
};

const handleExport = () => {
  exportAudio(
    props.rawAudio,
    region.value,
    speed.value,
    exportedVolume.value,
    equalizer.value,
    envelopePlugin.value,
    getEnvelopeVolumeAtTime,
    bitrate.value
  );
};

// Watch for fade changes and region updates
watch([fadeInDuration, fadeOutDuration], () => {
  updateEnvelopePoints(
    wavesurfer.value,
    region.value,
    fadeInEnabled.value,
    fadeInDuration.value,
    fadeOutEnabled.value,
    fadeOutDuration.value
  );
});

// Override the updateExportRegion to also update envelope
const originalUpdateExportRegion = updateExportRegion;
watch(region, () => {
  updateEnvelopePoints(
    wavesurfer.value,
    region.value,
    fadeInEnabled.value,
    fadeInDuration.value,
    fadeOutEnabled.value,
    fadeOutDuration.value
  );
}, { deep: true });

// Initialize envelope
onMounted(() => {
  createEnvelopePlugin();
  setVolume(wavesurfer.value, 100);
  
  const keyHandler = (event: KeyboardEvent) => {
    handleKeyPress(event, handlePlayPause, wavesurfer.value);
  };
  
  addEventListener('keydown', keyHandler);
  
  onBeforeUnmount(() => {
    removeEventListener('keydown', keyHandler);
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
}

#waveform ::part(region-handle) {
  background-color: #60a5fa !important;
  width: 15px !important;
  cursor: ew-resize !important;
  top: 0 !important;
  bottom: 0 !important;
  border-radius: 0 !important;
  opacity: 0.8 !important;
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

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d1d5db' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 12px;
  padding-right: 2rem;
}

.fade-slider::-webkit-slider-track {
  background: #475569;
  height: 4px;
  border-radius: 2px;
}

.fade-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: red;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -4px;
}

.fade-slider::-moz-range-track {
  background: #475569;
  height: 4px;
  border-radius: 2px;
}

.fade-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: red;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.slider-container :deep(input[type="range"]) {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.slider-container :deep(input[type="range"]::-webkit-slider-track) {
  background: #334155;
  height: 4px;
  border-radius: 2px;
}

.slider-container :deep(input[type="range"]::-webkit-slider-thumb) {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: red;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -6px;
}

#waveform ::part(canvases),
#waveform ::part(progress) {
  display: flex;
  align-items: center;
  height: 200px;
}
</style>
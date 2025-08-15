<template>
  <div class="waveform-container rounded p-4 mb-6">
    <div class="relative">
      <!-- Loading Spinner Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-90 rounded z-20"
      >
        <div class="flex flex-col items-center space-y-3">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p class="text-white text-sm font-medium">Loading audio track...</p>
        </div>
      </div>
      <div class="flex justify-between text-xs text-gray-400 mb-2">
        <span>{{ formatTime(region[0]) }}</span>
        <span>{{ formatTime(region[1]) }}</span>
      </div>
      <div class="relative">
        <div id="waveform" class="relative"></div>
        <div ref="timelineRef" id="wave-timeline" />

        <!-- Dark overlays for excluded areas -->
        <div
          v-if="wavesurfer && region"
          class="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
        >
          <!-- Left overlay (before cut start) -->
          <div
            class="absolute top-0 left-0 bottom-0 bg-black bg-opacity-60 transition-all duration-300"
            :style="{
              width: getRegionPixelPosition(region[0], wavesurfer) + 'px',
            }"
          ></div>

          <!-- Right overlay (after cut end) -->
          <div
            class="absolute top-0 right-0 bottom-0 bg-black bg-opacity-50 transition-all duration-300"
            :style="{
              width:
                getWaveformWidth() -
                getRegionPixelPosition(region[1], wavesurfer) +
                'px',
            }"
          ></div>
        </div>

        <!-- Cursor time marker -->
        <div
          v-if="cursorPosition > -1"
          class="absolute top-0 pointer-events-none z-10"
          :style="{
            left: cursorPosition + 'px',
            transform: 'translateX(-50%)',
          }"
        >
          <div class="relative">
            <div
              class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            >
              {{ formatTime(cursorTime) }}
            </div>
          </div>
        </div>
      </div>
      <div class="text-center text-gray-400 text-sm mt-2">
        {{ formatTime(region[1] - region[0]) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getRegionPixelPosition,
  getWaveformWidth,
  formatTime,
} from "../../utils/audioUtils";

defineProps<{
  region: number[];
  cursorPosition: number;
  cursorTime: number;
  wavesurfer: any;
  isLoading?: boolean;
}>();
</script>

<style scoped>
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
#waveform ::part(canvases),
#waveform ::part(progress) {
  display: flex;
  align-items: center;
  height: 200px;
}
</style>

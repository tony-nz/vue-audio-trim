<template>
  <div class="waveform-container rounded p-4 mb-6 overflow-visible">
    <div class="relative overflow-visible">
      <!-- Loading Spinner Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-90 rounded z-20"
      >
        <div class="flex flex-col items-center space-y-3">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"
          ></div>
          <p class="text-white text-sm font-medium">Loading audio track...</p>
        </div>
      </div>
      <div class="flex justify-between text-xs text-gray-400 mb-2">
        <span>{{ formatTime(region[0]) }}</span>
        <span>{{ formatTime(region[1]) }}</span>
      </div>
      <div class="relative px-4">
        <div id="waveform" class="relative"></div>
        <div ref="timelineRef" id="wave-timeline" class="mt-4" />

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
  margin: 0 !important;
  padding: 0 !important;
}

#waveform ::part(region-handle) {
  background-color: #60a5fa !important;
  width: 10px !important;
  cursor: ew-resize !important;
  top: 0 !important;
  bottom: 0 !important;
  border-radius: 0 !important;
  opacity: 1 !important;
  z-index: 10 !important;
}

#waveform ::part(region-handle-left) {
  left: 0 !important;
  transform: translateX(-100%) !important;
  margin-left: -0px !important;
}

#waveform ::part(region-handle-right) {
  right: 0 !important;
  transform: translateX(100%) !important;
  margin-right: 0px !important;
}
#waveform ::part(canvases),
#waveform ::part(progress) {
  display: flex;
  align-items: center;
  height: 200px;
}

/* Regions */
#waveform ::part(region) {
  box-sizing: border-box;
}

/* Region handles */
#waveform ::part(region-handle) {
  width: 10px !important;
  max-width: 10px !important;
  border: 1px solid #ddd;
  background: rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

#waveform ::part(region-handle:before),
#waveform ::part(region-handle:after) {
  content: "";
  display: block;
  position: absolute;
  z-index: 1;
  border-top: 1px solid #fff;
  border-bottom: 1px solid #fff;
  height: 4px;
  left: 5%;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
}

#waveform ::part(region-handle:before) {
  margin-top: -3px;
}

#waveform ::part(scroll) {
  overflow-x: visible !important;
  overflow-y: visible !important;
}
</style>

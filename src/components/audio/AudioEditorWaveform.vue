<template>
  <div
    class="waveform-container bg-dark-player rounded-lg p-5 mb-6 overflow-visible shadow-md border border-dark-player-border"
  >
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
      <div class="relative px-4">
        <div id="waveform" class="relative">
          <!-- Dark overlays for excluded areas (inside waveform only) -->
          <div
            v-if="wavesurfer && region"
            class="absolute top-0 left-0 right-0 h-full pointer-events-none z-[5]"
          >
            <!-- Left overlay (before cut start) -->
            <div
              class="absolute top-0 left-0 h-full bg-black bg-opacity-50 transition-all duration-300"
              :style="{
                width:
                  Math.max(
                    0,
                    getRegionPixelPosition(region[0], wavesurfer) - 14
                  ) + 'px',
              }"
            ></div>

            <!-- Right overlay (after cut end) -->
            <div
              class="absolute top-0 right-0 h-full bg-black bg-opacity-50 transition-all duration-300"
              :style="{
                width:
                  Math.max(
                    0,
                    getWaveformWidth() -
                      getRegionPixelPosition(region[1], wavesurfer) -
                      14
                  ) + 'px',
              }"
            ></div>
          </div>
        </div>
        <div ref="timelineRef" id="wave-timeline" class="mt-10 bg-slate-800" />

        <!-- Region handle time labels -->
        <div v-if="wavesurfer && region">
          <!-- Start time label -->
          <div
            class="absolute bottom-14 pointer-events-none z-15"
            :style="{
              left: getRegionPixelPosition(region[0], wavesurfer) + 10 + 'px',
            }"
          >
            <div class="absolute left-1/2 transform -translate-x-1/2">
              <div
                class="bg-dark-player-dark text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-dark-player-border font-medium"
              >
                {{ formatTime(region[0]) }}
              </div>
            </div>
          </div>

          <!-- End time label -->
          <div
            class="absolute bottom-14 pointer-events-none z-15"
            :style="{
              left: getRegionPixelPosition(region[1], wavesurfer) + 22 + 'px',
            }"
          >
            <div class="absolute left-1/2 transform -translate-x-1/2">
              <div
                class="bg-dark-player-dark text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-dark-player-border font-medium"
              >
                {{ formatTime(region[1]) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Playback time marker (follows the thick red playback cursor) -->
        <div
          v-if="currentTime !== undefined && wavesurfer"
          class="absolute top-0 bottom-0 pointer-events-none z-20"
          :style="{
            left: getRegionPixelPosition(currentTime, wavesurfer) + 16 + 'px',
          }"
        >
          <!-- White vertical line -->
          <div class="absolute top-0 bottom-0 w-[1px] bg-white"></div>

          <!-- Time display with arrow -->
          <div
            class="absolute -top-[35px] left-1/2 transform -translate-x-1/2 w-20 text-center"
          >
            <div class="relative">
              <!-- Time badge -->
              <div
                class="bg-white text-slate-900 text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-semibold shadow-lg"
              >
                {{ formatTime(currentTime) }}
              </div>
              <!-- Arrow pointing down -->
              <div
                class="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"
              ></div>
            </div>
          </div>
        </div>

        <!-- Hover cursor time marker with line -->
        <div
          v-if="cursorPosition > -1 && !isLoading"
          class="absolute top-0 bottom-0 pointer-events-none z-10"
          :style="{
            left: cursorPosition + 15 + 'px',
          }"
        >
          <!-- Vertical cursor line -->
          <div
            class="absolute top-0 bottom-0 w-[1px] bg-gray-400 opacity-50"
          ></div>

          <!-- Time display above cursor -->
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div
              class="bg-dark-player-dark text-gray-300 text-xs px-2 py-1 rounded whitespace-nowrap border border-dark-player-border"
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
  currentTime?: number;
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
  width: 15px !important;
  max-width: 15px !important;
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

/* #waveform ::part(region-handle-left) {
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
} */
</style>

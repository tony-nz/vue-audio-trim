<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3 w-full">
      <!-- Play Button -->
      <button
        class="text-gray-300 hover:text-white p-2 bg-dark-player-light border border-dark-player-border rounded-2xl transition-colors p-3 px-10"
        @click="$emit('play-pause')"
      >
        <i v-if="isPlaying" class="fas fa-pause text-xl"></i>
        <i v-else class="fas fa-play text-xl"></i>
      </button>

      <!-- Stop Button -->
      <button
        class="text-gray-300 hover:text-white p-2 bg-dark-player-light border border-dark-player-border rounded-2xl transition-colors p-3 px-6"
        @click="$emit('stop')"
        title="Stop and return to beginning"
      >
        <i class="fas fa-stop text-xl"></i>
      </button>

      <!-- Fade In Control -->
      <div class="flex items-center">
        <div class="flex items-center">
          <button
            class="transition-all bg-dark-player-light border border-dark-player-border border-r-0 rounded-l-2xl p-4 pl-4 pr-2"
            :class="
              fadeInEnabled
                ? 'bg-dark-player text-white'
                : 'text-gray-300 hover:text-white hover:bg-dark-player-dark'
            "
            @click="$emit('toggle-fade-in')"
            title="Fade In"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="20"
              fill="none"
            >
              <path
                opacity=".1"
                d="M1 20c-.552 0-1-.446-1-.998v-4.215a1 1 0 0 1 1-1h.294c2.74.005 4.094-.163 5.705-.937 1.931-.927 3.601-2.653 5.035-5.476 1.37-2.697 2.882-4.55 4.583-5.718C18.64.267 20.274-.014 23.547.001H24a1 1 0 0 1 1 1V19.01c0 .552-.448.99-1 .99H1Z"
                :fill="fadeInEnabled ? '#10b981' : '#fff'"
              />
              <path
                d="M1 15.787a1 1 0 1 1 0-2h.294c2.74.005 4.094-.163 5.705-.937 1.931-.927 3.601-2.653 5.035-5.476 1.37-2.697 2.882-4.55 4.583-5.718C18.64.267 20.274-.014 23.547.001H24a1 1 0 1 1 0 2h-.462c-2.893-.013-4.197.211-5.79 1.304-1.402.962-2.702 2.558-3.93 4.975-1.626 3.199-3.607 5.247-5.953 6.373-1.962.942-3.55 1.14-6.574 1.134H1Z"
                :fill="fadeInEnabled ? '#10b981' : '#fff'"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Fade Out Control -->
      <div class="flex items-center">
        <button
          class="transition-all bg-dark-player-light border border-dark-player-border rounded-2xl p-4"
          :class="
            fadeOutEnabled
              ? 'bg-dark-player text-white'
              : 'text-gray-300 hover:text-white hover:bg-dark-player-dark'
          "
          @click="$emit('toggle-fade-out')"
          title="Fade Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="20"
            fill="none"
          >
            <path
              opacity=".1"
              d="M24 20c.552 0 1-.446 1-.998v-4.215a1 1 0 0 0-1-1h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 0 0-1 1V19.01c0 .552.448.99 1 .99H24Z"
              :fill="fadeOutEnabled ? '#10b981' : '#fff'"
            />
            <path
              d="M24 15.787a1 1 0 1 0 0-2h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 1 0 0 2h.462c2.893-.013 4.197.211 5.79 1.304 1.402.962 2.702 2.558 3.93 4.975 1.626 3.199 3.607 5.247 5.953 6.373 1.962.942 3.55 1.14 6.574 1.134H24Z"
              :fill="fadeOutEnabled ? '#10b981' : '#fff'"
            />
          </svg>
        </button>
      </div>

      <!-- Region Controls -->
      <div class="flex items-center space-x-1">
        <div
          class="flex items-center bg-dark-player-light border border-dark-player-border rounded-2xl overflow-hidden"
        >
          <div class="relative">
            <button
              @mousedown="startAdjusting('start', -0.1)"
              @mouseup="stopAdjusting"
              @mouseleave="stopAdjusting"
              @click="$emit('adjust-start-time', -0.1)"
              class="px-3 py-3 text-gray-300 hover:text-white hover:bg-dark-player transition-colors text-sm"
              title="Move start time back"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          </div>
          <div class="px-3 py-3 bg-dark-player-dark">
            <input
              :value="formatTime(region[0])"
              @input="handleStartTimeInput"
              class="bg-transparent text-white text-sm w-16 text-center focus:outline-none"
              type="text"
              title="Start time"
            />
          </div>
          <div class="relative">
            <button
              @mousedown="startAdjusting('start', 0.1)"
              @mouseup="stopAdjusting"
              @mouseleave="stopAdjusting"
              @click="$emit('adjust-start-time', 0.1)"
              class="px-3 py-3 text-gray-300 hover:text-white hover:bg-dark-player transition-colors text-sm"
              title="Move start time forward"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div
          class="flex items-center bg-dark-player-light border border-dark-player-border rounded-2xl overflow-hidden"
        >
          <div class="relative">
            <button
              @mousedown="startAdjusting('end', -0.1)"
              @mouseup="stopAdjusting"
              @mouseleave="stopAdjusting"
              @click="$emit('adjust-end-time', -0.1)"
              class="px-3 py-3 text-gray-300 hover:text-white hover:bg-dark-player transition-colors text-sm"
              title="Move end time back"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          </div>
          <div class="px-3 py-3 bg-dark-player-dark">
            <input
              :value="formatTime(region[1])"
              @input="handleEndTimeInput"
              class="bg-transparent text-white text-sm w-16 text-center focus:outline-none"
              type="text"
              title="End time"
            />
          </div>
          <div class="relative">
            <button
              @mousedown="startAdjusting('end', 0.1)"
              @mouseup="stopAdjusting"
              @mouseleave="stopAdjusting"
              @click="$emit('adjust-end-time', 0.1)"
              class="px-3 py-3 text-gray-300 hover:text-white hover:bg-dark-player transition-colors text-sm"
              title="Move end time forward"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side controls -->
    <div class="flex items-center space-x-4">
      <!-- Custom Format Dropdown -->
      <CustomDropdown
        :model-value="exportFormat"
        :options="formatOptions"
        @update:model-value="$emit('update-export-format', $event)"
      />

      <!-- Export Button -->
      <button
        @click="$emit('export')"
        :disabled="isExporting"
        class="bg-white text-black font-bold py-3 px-8 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <span v-if="!isExporting">Save</span>
        <div v-else class="flex items-center space-x-2">
          <div
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-black"
          ></div>
          <span>Exporting...</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import CustomDropdown from "../common/CustomDropdown.vue";
import { formatTime } from "../../utils/audioUtils";

// Continuous adjustment variables
let adjustmentInterval: number | null = null;

const emit = defineEmits<{
  "play-pause": [];
  stop: [];
  "toggle-fade-in": [];
  "toggle-fade-out": [];
  "toggle-trim-mode": [];
  "adjust-start-time": [delta: number];
  "adjust-end-time": [delta: number];
  "set-start-time": [time: number];
  "set-end-time": [time: number];
  "update-export-format": [format: string];
  "open-fade-settings": [];
  export: [];
}>();

defineProps<{
  isPlaying: boolean;
  fadeInEnabled: boolean;
  fadeOutEnabled: boolean;
  isTrimMode: boolean;
  region: number[];
  exportFormat: string;
  isExporting?: boolean;
}>();

// Format options for the custom dropdown
const formatOptions = [
  { value: "wav", label: "WAV", badge: "instant" },
  { value: "mp3", label: "MP3" },
];

const startAdjusting = (type: "start" | "end", delta: number) => {
  // Clear any existing interval
  if (adjustmentInterval) {
    clearInterval(adjustmentInterval);
  }

  // Start continuous adjustment after a delay
  adjustmentInterval = setTimeout(() => {
    adjustmentInterval = setInterval(() => {
      if (type === "start") {
        emit("adjust-start-time", delta);
      } else {
        emit("adjust-end-time", delta);
      }
    }, 100) as unknown as number;
  }, 300) as unknown as number;
};

const stopAdjusting = () => {
  if (adjustmentInterval) {
    clearInterval(adjustmentInterval);
    adjustmentInterval = null;
  }
};

const handleStartTimeInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const timeString = target.value;

  // Parse time string (format: MM:SS.S)
  const parts = timeString.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    const totalSeconds = minutes * 60 + seconds;
    emit("set-start-time", totalSeconds);
  }
};

const handleEndTimeInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const timeString = target.value;

  // Parse time string (format: MM:SS.S)
  const parts = timeString.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    const totalSeconds = minutes * 60 + seconds;
    emit("set-end-time", totalSeconds);
  }
};

onBeforeUnmount(() => {
  if (adjustmentInterval) {
    clearInterval(adjustmentInterval);
  }
});
</script>

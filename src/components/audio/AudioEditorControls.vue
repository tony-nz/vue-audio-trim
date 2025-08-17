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
          <button
            class="transition-all bg-dark-player-light border border-dark-player-border border-l-0 rounded-r-2xl p-4 pl-2 pr-4"
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
                d="M24 20c.552 0 1-.446 1-.998v-4.215a1 1 0 0 0-1-1h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 0 0-1 1V19.01c0 .552.448.99 1 .99h23Z"
                :fill="fadeOutEnabled ? '#10b981' : '#fff'"
              />
              <path
                d="M24 15.787a1 1 0 1 0 0-2h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 1 0 0 2h.462c2.893-.013 4.197.211 5.79 1.304 1.402.962 2.702 2.558 3.93 4.975 1.626 3.199 3.607 5.247 5.953 6.373 1.962.942 3.55 1.14 6.574 1.134H24Z"
                :fill="fadeOutEnabled ? '#10b981' : '#fff'"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Trim/Cut Toggle -->
      <button
        class="hidden text-gray-300 hover:text-white p-2"
        :class="{ 'text-white': isTrimMode }"
        @click="$emit('toggle-trim-mode')"
        title="Toggle Trim/Cut Mode"
      >
        <i class="fas fa-cut"></i>
      </button>

      <!-- Start Time with Arrows -->
      <div class="flex">
        <div
          class="flex items-center space-x-2 bg-dark-player-light border border-dark-player-border border-r-0 p-2 pl-6 rounded-l-2xl"
        >
          <input
            :value="formatTime(region[0])"
            @blur="updateStartTimeFromInput($event)"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            class="text-white font-bold text-sm w-16 bg-transparent border-none outline-none text-center"
            placeholder="00:00.0"
          />
          <div class="flex flex-col">
            <button
              class="text-gray-500 hover:text-white leading-none"
              @mousedown="startAdjusting('start', 0.1)"
              @mouseup="stopAdjusting"
              @mouseleave="stopAdjusting"
              @click="$emit('adjust-start-time', 0.1)"
            >
              <i class="fas fa-caret-up text-sm"></i>
            </button>
            <button
              class="text-gray-500 hover:text-white leading-none"
              @mousedown="startAdjusting('start', -0.1)"
              @mouseup="stopAdjusting"
              @mouseleave="stopAdjusting"
              @click="$emit('adjust-start-time', -0.1)"
            >
              <i class="fas fa-caret-down text-xs"></i>
            </button>
          </div>
        </div>

        <!-- End Time with Arrows -->
        <div
          class="flex items-center space-x-2 bg-dark-player-light border border-dark-player-border border-l-0 p-2 pr-6 rounded-r-2xl"
        >
          <input
            :value="formatTime(region[1])"
            @blur="updateEndTimeFromInput($event)"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            class="text-white font-bold text-sm w-16 bg-transparent border-none outline-none text-center"
            placeholder="00:00.0"
          />
          <div class="flex flex-col">
            <button
              class="text-gray-500 hover:text-white leading-none"
              @mousedown="startAdjusting('end', 0.1)"
              @mouseup="stopAdjusting"
              @mouseleave="stopAdjusting"
              @click="$emit('adjust-end-time', 0.1)"
            >
              <i class="fas fa-caret-up text-xs"></i>
            </button>
            <button
              class="text-gray-500 hover:text-white leading-none"
              @mousedown="startAdjusting('end', -0.1)"
              @mouseup="stopAdjusting"
              @mouseleave="stopAdjusting"
              @click="$emit('adjust-end-time', -0.1)"
            >
              <i class="fas fa-caret-down text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-4">
      <!-- Format Dropdown -->
      <div class="relative">
        <select
          :value="exportFormat"
          @change="
            $emit(
              'update-export-format',
              ($event.target as HTMLSelectElement).value
            )
          "
          class="appearance-none bg-dark-player-light border border-dark-player-border rounded-2xl text-white font-bold pl-8 pr-12 py-3 text-center cursor-pointer hover:bg-dark-player focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
        >
          <option value="wav">wav (instant)</option>
          <option value="mp3">mp3</option>
        </select>
        <!-- Custom arrow -->
        <div
          class="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
        >
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <button
        class="bg-white text-slate-800 px-6 py-3 rounded-2xl font-medium hover:bg-gray-100 relative"
        :disabled="isExporting"
        @click="$emit('export')"
      >
        <span v-if="!isExporting">Save</span>
        <div v-else class="flex items-center space-x-2">
          <div
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-800"
          ></div>
          <span>Exporting...</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
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
  export: [];
}>();

const startAdjusting = (type: "start" | "end", delta: number) => {
  // Clear any existing interval
  if (adjustmentInterval) {
    clearInterval(adjustmentInterval);
  }

  // Start continuous adjustment after initial delay
  adjustmentInterval = window.setInterval(() => {
    if (type === "start") {
      emit("adjust-start-time", delta);
    } else {
      emit("adjust-end-time", delta);
    }
  }, 100); // Adjust every 100ms
};

const stopAdjusting = () => {
  if (adjustmentInterval) {
    clearInterval(adjustmentInterval);
    adjustmentInterval = null;
  }
};

// Parse time string (MM:SS.S format) to seconds
const parseTimeString = (timeStr: string): number => {
  const parts = timeStr.split(":");
  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0]) || 0;
  const seconds = parseFloat(parts[1]) || 0;

  return minutes * 60 + seconds;
};

const updateStartTimeFromInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const newTime = parseTimeString(input.value);
  emit("set-start-time", newTime);
};

const updateEndTimeFromInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const newTime = parseTimeString(input.value);
  emit("set-end-time", newTime);
};

// Clean up on unmount
onBeforeUnmount(() => {
  stopAdjusting();
});

defineProps<{
  isPlaying: boolean;
  fadeInEnabled: boolean;
  fadeOutEnabled: boolean;
  isTrimMode: boolean;
  region: number[];
  exportFormat: string;
  isExporting?: boolean;
}>();
</script>

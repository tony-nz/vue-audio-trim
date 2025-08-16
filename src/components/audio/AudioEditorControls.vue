<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3 w-full">
      <!-- Play Button -->
      <button
        class="text-gray-300 hover:text-white p-2 bg-slate-800 rounded-2xl transition-colors p-3 px-10"
        @click="$emit('play-pause')"
      >
        <i v-if="isPlaying" class="fas fa-pause text-xl"></i>
        <i v-else class="fas fa-play text-xl"></i>
      </button>

      <!-- Fade In Control -->
      <div class="flex items-center">
        <div class="flex items-center">
          <button
            class="transition-all bg-slate-800 rounded-l-2xl p-4 pl-4 pr-2"
            :class="
              fadeInEnabled
                ? 'bg-slate-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-slate-900'
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
                fill="#fff"
              />
              <path
                d="M1 15.787a1 1 0 1 1 0-2h.294c2.74.005 4.094-.163 5.705-.937 1.931-.927 3.601-2.653 5.035-5.476 1.37-2.697 2.882-4.55 4.583-5.718C18.64.267 20.274-.014 23.547.001H24a1 1 0 1 1 0 2h-.462c-2.893-.013-4.197.211-5.79 1.304-1.402.962-2.702 2.558-3.93 4.975-1.626 3.199-3.607 5.247-5.953 6.373-1.962.942-3.55 1.14-6.574 1.134H1Z"
                fill="#fff"
              />
            </svg>
          </button>
          <button
            class="transition-all bg-slate-800 rounded-r-2xl p-4 pl-2 pr-4"
            :class="
              fadeOutEnabled
                ? 'bg-slate-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-slate-900'
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
                fill="#fff"
              />
              <path
                d="M24 15.787a1 1 0 1 0 0-2h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 1 0 0 2h.462c2.893-.013 4.197.211 5.79 1.304 1.402.962 2.702 2.558 3.93 4.975 1.626 3.199 3.607 5.247 5.953 6.373 1.962.942 3.55 1.14 6.574 1.134H24Z"
                fill="#fff"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Trim/Cut Toggle -->
      <button
        class="text-gray-300 hover:text-white p-2"
        :class="{ 'text-white': isTrimMode }"
        @click="$emit('toggle-trim-mode')"
        title="Toggle Trim/Cut Mode"
      >
        <i class="fas fa-cut"></i>
      </button>

      <!-- Start Time with Arrows -->
      <div class="flex">
        <div
          class="flex items-center space-x-2 bg-slate-800 p-2 pl-6 rounded-l-2xl"
        >
          <span class="text-white font-bold text-sm">{{
            formatTime(region[0])
          }}</span>
          <div class="flex flex-col">
            <button
              class="text-gray-500 hover:text-white leading-none"
              @click="$emit('adjust-start-time', 0.1)"
            >
              <i class="fas fa-caret-up text-sm"></i>
            </button>
            <button
              class="text-gray-500 hover:text-white leading-none"
              @click="$emit('adjust-start-time', -0.1)"
            >
              <i class="fas fa-caret-down text-xs"></i>
            </button>
          </div>
        </div>

        <!-- End Time with Arrows -->
        <div
          class="flex items-center space-x-2 bg-slate-800 p-2 pr-6 rounded-r-2xl"
        >
          <span class="text-white font-bold text-sm">{{
            formatTime(region[1])
          }}</span>
          <div class="flex flex-col">
            <button
              class="text-gray-500 hover:text-white leading-none"
              @click="$emit('adjust-end-time', 0.1)"
            >
              <i class="fas fa-caret-up text-xs"></i>
            </button>
            <button
              class="text-gray-500 hover:text-white leading-none"
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
      <select
        :value="exportFormat"
        @change="
          $emit(
            'update-export-format',
            ($event.target as HTMLSelectElement).value
          )
        "
        class="bg-slate-800 rounded-2xl text-white font-bold px-8 py-3 text-center cursor-pointer hover:bg-slate-600 focus:outline-none"
      >
        <option value="mp3">mp3</option>
        <option value="wav">wav</option>
        <option value="flac">flac</option>
        <option value="ogg">ogg</option>
      </select>

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
import { formatTime } from "../../utils/audioUtils";

defineProps<{
  isPlaying: boolean;
  fadeInEnabled: boolean;
  fadeOutEnabled: boolean;
  isTrimMode: boolean;
  region: number[];
  exportFormat: string;
  isExporting?: boolean;
}>();

defineEmits<{
  "play-pause": [];
  "toggle-fade-in": [];
  "toggle-fade-out": [];
  "toggle-trim-mode": [];
  "adjust-start-time": [delta: number];
  "adjust-end-time": [delta: number];
  "update-export-format": [format: string];
  export: [];
}>();
</script>

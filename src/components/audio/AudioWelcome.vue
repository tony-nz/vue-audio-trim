<template>
  <div>
    <!-- Navigation -->
    <nav
      class="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800"
    >
      <div
        class="container mx-auto px-6 py-4 flex justify-between items-center"
      >
        <div class="flex items-center space-x-2">
          <div class="flex space-x-1">
            <div class="w-1 h-6 bg-purple-500 wave-bar"></div>
            <div class="w-1 h-6 bg-purple-400 wave-bar"></div>
            <div class="w-1 h-6 bg-purple-500 wave-bar"></div>
            <div class="w-1 h-6 bg-purple-400 wave-bar"></div>
            <div class="w-1 h-6 bg-purple-500 wave-bar"></div>
          </div>
          <span class="text-xl font-bold gradient-text">VueAudioTrim</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36px"
            height="23px"
            viewBox="0 0 36 23"
            version="1.1"
          >
            <defs>
              <linearGradient
                id="trimGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" style="stop-color: #667eea" />
                <stop offset="100%" style="stop-color: #764ba2" />
              </linearGradient>
            </defs>
            <g stroke="none" fill="none">
              <g stroke-width="2.5">
                <!-- Left Bar -->
                <polyline
                  stroke="url(#trimGradient)"
                  stroke-linecap="round"
                  points="5 0 0 0 0 23 5 23"
                ></polyline>
                <!-- Right Bar -->
                <polyline
                  stroke="url(#trimGradient)"
                  stroke-linecap="round"
                  points="31 0 36 0 36 23 31 23"
                ></polyline>
                <!-- Waveform Pattern in the Middle -->
                <g transform="translate(6, 4)">
                  <line
                    stroke="url(#trimGradient)"
                    x1="0"
                    y1="15"
                    x2="25"
                    y2="15"
                  ></line>
                  <!-- Base line -->
                  <line
                    stroke="url(#trimGradient)"
                    x1="5"
                    y1="5"
                    x2="5"
                    y2="20"
                  ></line>
                  <!-- Left peak -->
                  <line
                    stroke="url(#trimGradient)"
                    x1="12"
                    y1="3"
                    x2="12"
                    y2="22"
                  ></line>
                  <!-- Middle peak -->
                  <line
                    stroke="url(#trimGradient)"
                    x1="19"
                    y1="7"
                    x2="19"
                    y2="18"
                  ></line>
                  <!-- Right peak -->
                </g>
              </g>
            </g>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="36px"
            height="23px"
            viewBox="0 0 36 23"
            version="1.1"
          >
            <g stroke="none" stroke-width="0" fill="none" fill-rule="evenodd">
              <g
                transform="translate(-725.000000, -9977.000000)"
                stroke="#764ba2"
                stroke-width="2.5"
              >
                <g transform="translate(0.000000, 8332.000000)">
                  <g transform="translate(725.000000, 1633.000000)">
                    <g transform="translate(1.000000, 13.000000)">
                      <polyline
                        stroke-linecap="round"
                        points="8 0 0 0 0 21 8 21"
                      ></polyline>
                      <polyline
                        stroke-linecap="round"
                        transform="translate(30.000000, 10.500000) scale(-1, 1) translate(-30.000000, -10.500000) "
                        points="34 0 26 0 26 21 34 21"
                      ></polyline>
                      <g
                        transform="translate(8.500000, 0.500000)"
                        stroke-linecap="square"
                      >
                        <line x1="0.5" y1="5.5" x2="0.5" y2="14.5"></line>
                        <line x1="16.5" y1="5.5" x2="16.5" y2="14.5"></line>
                        <line x1="4.5" y1="3" x2="4.5" y2="17"></line>
                        <line x1="12.5" y1="3" x2="12.5" y2="17"></line>
                        <line x1="8.5" y1="0" x2="8.5" y2="20"></line>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div class="hidden md:flex space-x-8">
          <a
            href="https://github.com/tony-nz/vue-audio-trim"
            target="_blank"
            class="group transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              viewBox="0 0 1024 1024"
              fill="#ffffff"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                transform="scale(64)"
                fill="#ffffff"
                class="group-hover:fill-purple-400 transition"
              />
            </svg>
          </a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-24 pb-20 px-6">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-7xl font-bold mb-6">
            <span class="gradient-text">Visual Audio Editing</span><br />
            Made Simple
          </h1>
          <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Upload your audio file and start editing instantly
          </p>
        </div>
      </div>

      <div
        class="bg-gray-800 rounded-2xl border border-gray-700 mx-auto max-w-4xl"
      >
        <!-- Upload Interface -->
        <div v-if="!props.rawAudio" class="p-12 text-center">
          <div class="mb-8">
            <svg
              class="w-24 h-24 text-purple-500 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <h3 class="text-2xl font-bold mb-4">Upload Your Audio File</h3>
            <p class="text-gray-400 mb-8">
              Supports MP3, WAV, OGG, and more formats
            </p>
          </div>

          <CommonUploader
            accept="audio/*"
            @set-file="$emit('set-audio', $event)"
            @set-file-duration="$emit('set-audio-duration', $event)"
          >
            <button
              class="bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-4 rounded-full font-semibold hover-glow transition duration-300 transform hover:scale-105 inline-flex items-center space-x-3"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <span>Upload Audio File</span>
            </button>
          </CommonUploader>

          <p class="text-sm text-gray-500 mt-4">
            No signup required • 100% free to try
          </p>
        </div>

        <!-- Audio Editor -->
        <div v-else class="p-6">
          <AudioEditor
            :raw-audio="props.rawAudio"
            :raw-audio-duration="props.rawAudioDuration"
            @close="$emit('close')"
          />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-6 bg-gray-800/50">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Powerful Features
          </h2>
          <p class="text-xl text-gray-400">
            Everything you need for quick and precise audio editing
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition duration-300 transform hover:scale-105"
          >
            <div
              class="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-6"
            >
              <svg
                class="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                ></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">Precision Cutting</h3>
            <p class="text-gray-400">
              Cut and trim audio with millisecond precision using our visual
              waveform editor
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition duration-300 transform hover:scale-105"
          >
            <div
              class="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-6"
            >
              <svg
                class="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                ></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">Fade Effects</h3>
            <p class="text-gray-400">
              Apply smooth fade in and fade out effects with customizable curves
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition duration-300 transform hover:scale-105"
          >
            <div
              class="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-6"
            >
              <svg
                class="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                ></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">Volume Control</h3>
            <p class="text-gray-400">
              Adjust volume levels with precision mixing controls and real-time
              preview
            </p>
          </div>

          <!-- Feature 4 -->
          <div
            class="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition duration-300 transform hover:scale-105"
          >
            <div
              class="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-6"
            >
              <svg
                class="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">BPM Adjustment</h3>
            <p class="text-gray-400">
              Change tempo and BPM without affecting pitch quality
            </p>
          </div>

          <!-- Feature 5 -->
          <div
            class="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition duration-300 transform hover:scale-105"
          >
            <div
              class="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-6"
            >
              <svg
                class="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                ></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">Easy Export</h3>
            <p class="text-gray-400">
              Export your edited audio in multiple formats with one click
            </p>
          </div>

          <!-- Feature 6 -->
          <div
            class="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition duration-300 transform hover:scale-105"
          >
            <div
              class="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-6"
            >
              <svg
                class="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                ></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4">Visual Interface</h3>
            <p class="text-gray-400">
              See your audio waveform in real-time for precise editing
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { withDefaults } from "vue";
import CommonUploader from "../common/CommonUploader.vue";
import AudioEditor from "./AudioEditor.vue";

const props = withDefaults(
  defineProps<{
    rawAudio?: File | null;
    rawAudioDuration?: number;
  }>(),
  {
    rawAudio: null,
    rawAudioDuration: 0,
  }
);

defineEmits<{
  "set-audio": [file: File];
  "set-audio-duration": [duration: number];
  close: [];
}>();
</script>

<style scoped>
@keyframes wave {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
}

.wave-bar {
  animation: wave 1s ease-in-out infinite;
}

.wave-bar:nth-child(2) {
  animation-delay: 0.1s;
}

.wave-bar:nth-child(3) {
  animation-delay: 0.2s;
}

.wave-bar:nth-child(4) {
  animation-delay: 0.3s;
}

.wave-bar:nth-child(5) {
  animation-delay: 0.4s;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hover-glow:hover {
  box-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
}

/* Smooth scrolling for navigation links */
html {
  scroll-behavior: smooth;
}
</style>

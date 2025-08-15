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
          <span class="text-xl font-bold gradient-text">Vue MP3 Editor</span>
        </div>
        <div class="hidden md:flex space-x-8">
          <a href="#features" class="hover:text-purple-400 transition"
            >Features</a
          >
          <a href="#demo" class="hover:text-purple-400 transition">Demo</a>
          <a href="#contact" class="hover:text-purple-400 transition"
            >Contact</a
          >
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
            Professional-grade audio editing with an intuitive visual interface.
            Cut, fade, adjust volume and BPM - all in your browser.
          </p>
        </div>

        <!-- Hero Visual -->
        <div class="relative">
          <div
            class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"
          ></div>
          <div
            class="relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover-glow transition duration-300"
          >
            <div class="flex justify-between items-center mb-6">
              <div class="flex space-x-2">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span class="text-gray-500 text-sm">WaveEdit Pro v2.0</span>
            </div>
            <div
              class="h-32 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg flex items-center justify-center"
            >
              <div class="flex space-x-1 h-20">
                <div class="w-2 bg-purple-500 rounded-full wave-bar"></div>
                <div class="w-2 bg-purple-400 rounded-full wave-bar"></div>
                <div class="w-2 bg-purple-500 rounded-full wave-bar"></div>
                <div class="w-2 bg-purple-400 rounded-full wave-bar"></div>
                <div class="w-2 bg-purple-500 rounded-full wave-bar"></div>
                <div class="w-2 bg-purple-400 rounded-full wave-bar"></div>
                <div class="w-2 bg-purple-500 rounded-full wave-bar"></div>
              </div>
            </div>
          </div>
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
            Everything you need for professional audio editing
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

    <!-- Demo Section -->
    <section id="demo" class="py-20 px-6">
      <div class="container mx-auto max-w-4xl">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Try It Now
          </h2>
          <p class="text-xl text-gray-400">
            Upload your audio file and start editing instantly
          </p>
        </div>

        <div class="bg-gray-800 rounded-2xl border border-gray-700">
          <!-- Upload Interface -->
          <div v-if="!rawAudio" class="p-12 text-center">
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
              :raw-audio="rawAudio"
              :raw-audio-duration="rawAudioDuration"
              @close="$emit('close')"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-6">
      <div class="container mx-auto max-w-4xl text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">
          Open Source Vue 3 MP3 Editor
        </h2>
        <p class="text-xl text-gray-400 mb-8">Check out the code on GitHub</p>
        <div class="flex justify-center">
          <a
            href="https://github.com/tony-nz/waveedit-pro"
            target="_blank"
            class="bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-lg font-semibold transition duration-300 inline-flex items-center space-x-3 border border-gray-600"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>
      </div>
    </section>
    <!-- Footer -->
    <footer id="contact" class="py-12 px-6 border-t border-gray-800">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center text-gray-500">
          <p>&copy; 2025 Vue MP3 Editor Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import CommonUploader from "../common/CommonUploader.vue";
import AudioEditor from "./AudioEditor.vue";

defineProps<{
  rawAudio?: File | null;
  rawAudioDuration?: number;
}>();

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

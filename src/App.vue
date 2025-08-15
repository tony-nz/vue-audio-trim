<script setup lang="ts">
import { ref } from "vue";
import AudioWelcome from "./components/audio/AudioWelcome.vue";
import AudioEditor from "./components/audio/AudioEditor.vue";

const rawAudio = ref<File | null>(null);
const rawAudioDuration = ref(0);

function close() {
  rawAudio.value = null;
  rawAudioDuration.value = 0;
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white overflow-x-hidden">
    <AudioWelcome
      :raw-audio="rawAudio"
      :raw-audio-duration="rawAudioDuration"
      @set-audio="rawAudio = $event"
      @set-audio-duration="rawAudioDuration = $event"
      @close="close"
    />
  </div>
</template>

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

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}
</style>

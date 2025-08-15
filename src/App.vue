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
  <div class="min-h-screen bg-gray-50">
    <AudioWelcome
      v-if="!rawAudio"
      @set-audio="rawAudio = $event"
      @set-audio-duration="rawAudioDuration = $event"
    />
    <AudioEditor
      v-else
      :raw-audio="rawAudio"
      :raw-audio-duration="rawAudioDuration"
      @close="close"
    />
  </div>
</template>

<style scoped>
</style>

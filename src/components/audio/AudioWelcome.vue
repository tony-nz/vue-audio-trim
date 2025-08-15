<template>
  <div class="flex flex-col items-center w-full gap-4 pt-12 mt-12">
    <h1 class="text-3xl font-bold">Audio Tools</h1>
    <p class="text-gray-600 mb-6">Cut track, change volume, change bitrate online</p>

    <CommonUploader
      accept="audio/*"
      @set-file="$emit('set-audio', $event)"
      @set-file-duration="$emit('set-audio-duration', $event)"
    >
      <BaseButton style="width: 250px" color="primary" label="Open file" size="large" unelevated />
    </CommonUploader>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CommonUploader from '../common/CommonUploader.vue';
import BaseButton from '../common/BaseButton.vue';

export default defineComponent({
  name: 'AudioWelcome',

  components: {
    CommonUploader,
    BaseButton,
  },

  emits: ['set-audio', 'set-audio-duration'],

  setup() {
    return {};
  },
});
</script>

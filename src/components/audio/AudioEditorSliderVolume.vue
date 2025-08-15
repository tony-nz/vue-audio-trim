<template>
  <AudioEditorSlider :model-value="modelValue" v-bind="$attrs" @update:model-value="$emit('update:model-value', $event)">
    <template #append>
      <i v-if="modelValue >= 60" class="pi pi-volume-up" />
      <i v-else-if="modelValue > 0" class="pi pi-volume-down" />
      <i v-else class="pi pi-volume-off" />
    </template>
  </AudioEditorSlider>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AudioEditorSlider from './AudioEditorSlider.vue';

export default defineComponent({
  name: 'AudioEditorSliderVolume',

  components: { AudioEditorSlider },

  props: {
    modelValue: {
      type: Number,
      default: 50,
    },
  },

  emits: ['update:model-value'],

  setup() {
    return {};
  },
});
</script>

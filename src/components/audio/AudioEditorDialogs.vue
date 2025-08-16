<template>
  <div>
    <BaseDialog
      title="Finding song BPM"
      confirm-text="Confirm"
      confirm-classes="full-width"
      :confirm-loading="isTempoLoading"
      :model-value="dialog.openedName.value === 'findBPM'"
      hide-close-button
      hide-close-icon
    >
      Please wait 5-20 seconds
    </BaseDialog>

    <BaseDialog
      type="delete"
      title="Close current audio"
      confirm-text="Confirm"
      :model-value="dialog.openedName.value === 'closeConfirm'"
      @close="$emit('close')"
      @confirm="$emit('confirm-close')"
    >
      Are you sure you want to close this file?
    </BaseDialog>

    <BaseDialog
      title="Fade Settings"
      confirm-text="Apply"
      :model-value="dialog.openedName.value === 'fadeSettings'"
      @close="$emit('close')"
      @confirm="handleConfirm"
    >
      <div class="space-y-6">
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-white">Fade In Duration</h3>
          <div class="flex items-center space-x-4">
            <input
              v-model.number="fadeInDuration"
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <span class="text-white text-sm font-medium w-16">{{ fadeInDuration }}s</span>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-medium text-white">Fade Out Duration</h3>
          <div class="flex items-center space-x-4">
            <input
              v-model.number="fadeOutDuration"
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <span class="text-white text-sm font-medium w-16">{{ fadeOutDuration }}s</span>
          </div>
        </div>

        <div class="text-sm text-gray-400">
          Adjust the duration of fade in and fade out effects. These apply during both playback and export.
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseDialog from "../common/BaseDialog.vue";

const props = defineProps<{
  dialog: any;
  isTempoLoading: boolean;
  fadeInDuration: number;
  fadeOutDuration: number;
}>();

const emit = defineEmits<{
  close: [];
  "confirm-close": [];
  "apply-fade-settings": [fadeInDuration: number, fadeOutDuration: number];
}>();

// Local state for dialog sliders
const fadeInDuration = ref(props.fadeInDuration);
const fadeOutDuration = ref(props.fadeOutDuration);

// Update local state when props change
watch(() => props.fadeInDuration, (newVal) => fadeInDuration.value = newVal);
watch(() => props.fadeOutDuration, (newVal) => fadeOutDuration.value = newVal);

// Override the confirm emit to include fade settings
const handleConfirm = () => {
  emit('apply-fade-settings', fadeInDuration.value, fadeOutDuration.value);
};
</script>

<style scoped>
.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
}

.slider-thumb::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.slider-thumb::-webkit-slider-track {
  background: #374151;
  height: 8px;
  border-radius: 4px;
}

.slider-thumb::-moz-range-track {
  background: #374151;
  height: 8px;
  border-radius: 4px;
}
</style>

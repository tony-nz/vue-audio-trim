<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="isOpen"
      class="absolute inset-0 z-50 flex items-center justify-center"
    >
      <!-- Background overlay -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>

      <!-- Settings panel -->
      <div
        class="relative bg-gray-800 rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full border border-gray-700"
      >
        <!-- Close button -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 class="text-2xl font-bold text-white mb-6">Settings</h2>

        <div class="space-y-8">
          <!-- Fade In Duration -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-gray-300"
              >Fade In Duration</label
            >
            <div class="flex items-center space-x-4">
              <input
                v-model.number="localFadeInDuration"
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                :style="{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                    ((localFadeInDuration - 0.5) / 9.5) * 100
                  }%, #374151 ${
                    ((localFadeInDuration - 0.5) / 9.5) * 100
                  }%, #374151 100%)`,
                }"
              />
              <div class="text-white text-sm font-medium w-12 text-right">
                {{ localFadeInDuration }}s
              </div>
            </div>
          </div>

          <!-- Fade Out Duration -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-gray-300"
              >Fade Out Duration</label
            >
            <div class="flex items-center space-x-4">
              <input
                v-model.number="localFadeOutDuration"
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                :style="{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                    ((localFadeOutDuration - 0.5) / 9.5) * 100
                  }%, #374151 ${
                    ((localFadeOutDuration - 0.5) / 9.5) * 100
                  }%, #374151 100%)`,
                }"
              />
              <div class="text-white text-sm font-medium w-12 text-right">
                {{ localFadeOutDuration }}s
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-500 pt-2">
            Adjust the duration of fade in and fade out effects. These apply
            during both playback and export.
          </p>

          <!-- Action buttons -->
          <div class="flex space-x-3 pt-4">
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              @click="handleApply"
              class="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  isOpen: boolean;
  fadeInDuration: number;
  fadeOutDuration: number;
}>();

const emit = defineEmits<{
  close: [];
  "apply-fade-settings": [fadeInDuration: number, fadeOutDuration: number];
}>();

// Local state for sliders
const localFadeInDuration = ref(props.fadeInDuration);
const localFadeOutDuration = ref(props.fadeOutDuration);

// Update local state when props change
watch(
  () => props.fadeInDuration,
  (newVal) => (localFadeInDuration.value = newVal)
);
watch(
  () => props.fadeOutDuration,
  (newVal) => (localFadeOutDuration.value = newVal)
);

const handleApply = () => {
  emit(
    "apply-fade-settings",
    localFadeInDuration.value,
    localFadeOutDuration.value
  );
  emit("close");
};
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  border-radius: 9999px;
}
</style>

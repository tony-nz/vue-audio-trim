<template>
  <div class="mb-6 bg-dark-player-light rounded-lg p-4 border border-dark-player-border">
    <div v-show="selectedAction === 'volume'" class="space-y-4">
      <AudioEditorSliderVolume
        :model-value="volume"
        label="Browser volume"
        @update:model-value="$emit('update-volume', $event)"
      />
      <AudioEditorSliderVolume
        :model-value="exportedVolume"
        label="Export volume"
        @update:model-value="$emit('update-exported-volume', $event)"
      />
    </div>

    <div v-show="selectedAction === 'speed'" class="space-y-4">
      <div class="text-center text-gray-300">
        Average BPM ~{{
          musicInfo?.tempo
            ? Math.round(musicInfo?.tempo * (speed / 100))
            : "Undefined"
        }}
      </div>
      <AudioEditorSlider
        :model-value="speed"
        label="Speed"
        :label-value="speed / 100"
        :min="10"
        :max="300"
        :step="10"
        @update:model-value="$emit('update-speed', $event)"
      />
    </div>

    <div v-show="selectedAction === 'bitrate'" class="space-y-4">
      <AudioEditorSlider
        :model-value="bitrate"
        label="Export bitrate"
        :min="16"
        :max="320"
        @update:model-value="$emit('update-bitrate', $event)"
      />
    </div>

    <div v-show="selectedAction === 'equalizer'" class="space-y-4">
      <!-- Preset Buttons -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="preset in eqPresets"
          :key="preset.name"
          class="flex items-center px-3 py-1.5 rounded-lg transition-all text-xs bg-dark-player-light text-gray-300 hover:text-white hover:bg-dark-player border border-dark-player-border"
          @click="$emit('apply-preset', preset.values)"
        >
          {{ preset.name }}
        </button>
      </div>
      
      <!-- Equalizer Sliders -->
      <div class="flex flex-row gap-4 w-full">
        <div class="flex flex-row flex-1 justify-between">
          <AudioEditorSlider
            v-for="(item, index) in equalizer"
            :key="item.f"
            :model-value="item.value"
            :label="item.f.toString()"
            :min="-12"
            :max="12"
            vertical
            reverse
            @update:model-value="$emit('update-equalizer', $event, index)"
          />
        </div>
        <button
          class="self-center text-gray-300 hover:text-white p-2 flex-shrink-0"
          style="margin-bottom: 28px"
          title="Reset EQ"
          @click="$emit('reset-equalizer')"
        >
          <i class="fas fa-undo"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AudioEditorSliderVolume from "./AudioEditorSliderVolume.vue";
import AudioEditorSlider from "./AudioEditorSlider.vue";
import type { EqItem } from "../../composables/audio/useAudioEffects";

interface MusicInfo {
  tempo?: number;
}

defineProps<{
  selectedAction: string;
  volume: number;
  exportedVolume: number;
  speed: number;
  musicInfo: MusicInfo | null;
  bitrate: number;
  equalizer: EqItem[];
}>();

defineEmits<{
  "update-volume": [value: number];
  "update-exported-volume": [value: number];
  "update-speed": [value: number];
  "update-bitrate": [value: number];
  "update-equalizer": [value: number, index: number];
  "reset-equalizer": [];
  "apply-preset": [values: number[]];
}>();

// Equalizer presets (values for 32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000 Hz)
const eqPresets = [
  { name: "Flat", values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: "Rock", values: [3, 2, -1, -2, 1, 2, 3, 4, 3, 2] },
  { name: "Pop", values: [-1, 2, 4, 3, 0, -1, -1, 2, 3, 2] },
  { name: "Jazz", values: [2, 1, 0, 1, 2, 2, 1, 1, 2, 2] },
  { name: "Classical", values: [0, 0, 0, 0, 0, 0, -2, -2, -2, -3] },
  { name: "Bass Boost", values: [6, 4, 2, 1, 0, -1, -2, -2, -1, 0] },
  { name: "Treble Boost", values: [0, -1, -2, -1, 0, 1, 2, 4, 5, 6] },
  { name: "Vocal", values: [-2, -1, 0, 2, 4, 4, 3, 2, 1, 0] }
];
</script>

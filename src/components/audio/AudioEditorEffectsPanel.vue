<template>
  <div class="mb-6 bg-slate-700 bg-opacity-50 rounded p-4">
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

    <div v-show="selectedAction === 'equalizer'" class="flex flex-row gap-4">
      <div class="flex flex-row gap-2">
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
        class="self-center text-gray-300 hover:text-white p-2"
        style="margin-bottom: 28px"
        title="Reset EQ"
        @click="$emit('reset-equalizer')"
      >
        <i class="fas fa-undo"></i>
      </button>
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
}>();
</script>

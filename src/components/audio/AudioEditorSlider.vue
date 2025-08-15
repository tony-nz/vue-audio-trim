<template>
  <div v-if="vertical" class="flex flex-col items-center gap-2">
    <Slider
      :model-value="modelValue"
      :min="min"
      :max="max"
      orientation="vertical"
      class="h-32"
      v-bind="$attrs"
      @update:model-value="$emit('update:model-value', $event)"
    />
    <div v-if="label" class="text-xs">{{ label }}</div>
  </div>

  <div v-else class="flex items-center gap-4">
    <div v-if="label" class="flex justify-end items-center">
      {{ label }}
    </div>
    <div class="flex gap-3 items-center w-full">
      <Slider
        :model-value="modelValue"
        :min="min"
        :max="max"
        class="flex-1"
        v-bind="$attrs"
        @update:model-value="$emit('update:model-value', $event)"
      />
      <span class="text-sm w-12 text-right">{{ modelValue }}</span>
      <div v-if="$slots.append" class="ml-2">
        <slot name="append" />
      </div>
    </div>

    <BaseButton icon="restart_alt" tooltip="Reset field" @click="reset" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Slider from "primevue/slider";
import BaseButton from "../common/BaseButton.vue";

export default defineComponent({
  name: "AudioEditorSlider",

  components: {
    Slider,
    BaseButton,
  },

  props: {
    modelValue: {
      type: Number,
      default: 50,
    },
    max: {
      type: Number,
      default: 100,
    },
    min: {
      type: Number,
      default: 0,
    },
    label: {
      type: [Number, String],
      default: null,
    },

    vertical: Boolean,
  },

  emits: ["update:model-value"],

  setup(props, { emit }) {
    const defaultValue = ref(props.modelValue);
    function reset() {
      emit("update:model-value", defaultValue.value);
    }

    return {
      reset,
    };
  },
});
</script>

<template>
  <div class="flex items-center justify-between p-4 border-b border-slate-600">
    <div class="flex items-center">
      <button
        v-for="action in actions"
        :key="action.key"
        :class="[
          'text-gray-300 hover:text-white p-2 mr-2',
          selectedAction === action.key ? 'text-white' : '',
        ]"
        :title="action.tooltip"
        @click="$emit('select-action', action.key)"
      >
        <i :class="`fas fa-${action.icon}`"></i>
      </button>
    </div>

    <div class="flex items-center">
      <button
        class="text-gray-300 hover:text-white flex items-center p-2"
        @click="$emit('reset')"
      >
        <i class="fas fa-undo mr-2"></i>
        <span>Reset</span>
      </button>
      <button
        class="text-gray-300 hover:text-white p-2 ml-2"
        @click="$emit('close')"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Action {
  tooltip: string;
  key: string;
  icon: string;
}

defineProps<{
  actions: Action[];
  selectedAction: string;
}>();

defineEmits<{
  "select-action": [key: string];
  reset: [];
  close: [];
}>();
</script>

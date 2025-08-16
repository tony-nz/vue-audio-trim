<template>
  <div class="flex items-center justify-between p-4 border-b border-slate-600">
    <div class="flex items-center space-x-4 w-full mr-8">
      <!-- Action Buttons -->
      <div class="flex items-center space-x-2">
        <button
          v-for="action in actions"
          :key="action.key"
          :class="[
            'flex items-center px-4 py-2 rounded-lg transition-all',
            selectedAction === action.key
              ? 'bg-dark-player-light text-white border border-dark-player-border'
              : 'text-gray-300 hover:text-white hover:bg-dark-player-dark',
          ]"
          :title="action.tooltip"
          @click="$emit('select-action', action.key)"
        >
          <i :class="`fas fa-${action.icon} mr-2`"></i>
          <span
            v-if="selectedAction === action.key"
            class="text-sm font-medium"
          >
            {{ action.tooltip }}
          </span>
        </button>
      </div>

      <!-- Editable Title -->
      <div class="flex items-center w-full">
        <input
          :value="title"
          @blur="updateTitle($event)"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
          class="text-white font-medium text-lg bg-transparent border p-1 px-2 rounded border-slate-700 outline-none min-w-0 flex-1 w-full"
          :placeholder="title || 'Untitled'"
        />
      </div>
    </div>

    <div class="flex items-center">
      <button
        class="text-gray-300 hover:text-white flex items-center p-2"
        @click="$emit('open-fade-settings')"
        title="Fade Settings"
      >
        <i class="fas fa-cog mr-2"></i>
      </button>
      <button
        class="text-gray-300 hover:text-white flex items-center p-2 ml-2"
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
  title: string;
}>();

const emit = defineEmits<{
  "select-action": [key: string];
  "update-title": [title: string];
  "open-fade-settings": [];
  reset: [];
  close: [];
}>();

const updateTitle = (event: Event) => {
  const input = event.target as HTMLInputElement;
  emit("update-title", input.value);
};
</script>

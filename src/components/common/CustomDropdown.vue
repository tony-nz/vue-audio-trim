<template>
  <div class="relative" ref="dropdownRef">
    <!-- Selected value display -->
    <button
      @click="toggleDropdown"
      class="flex items-center justify-between bg-dark-player-light border border-dark-player-border rounded-2xl text-white font-bold px-4 py-3 cursor-pointer hover:bg-dark-player focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 min-w-[100px]"
      :class="{ 'ring-2 ring-green-500': isOpen }"
    >
      <span class="text-sm">{{ selectedOption?.label || modelValue }}</span>
      <svg
        class="ml-2 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1.5L6 6.5L11 1.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-[-10px]"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-[-10px]"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-2 bg-dark-player-light border border-dark-player-border rounded-2xl shadow-2xl z-50 overflow-hidden"
      >
        <div class="py-2">
          <button
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            class="w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-150"
            :class="
              option.value === modelValue
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-dark-player hover:text-white'
            "
          >
            <div class="flex items-center justify-between">
              <span>{{ option.label }}</span>
              <span v-if="option.badge" class="text-xs opacity-75">{{ option.badge }}</span>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
}

const props = defineProps<{
  modelValue: string;
  options: DropdownOption[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement>();

const selectedOption = computed(() => 
  props.options.find(option => option.value === props.modelValue)
);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option: DropdownOption) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const closeDropdown = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>
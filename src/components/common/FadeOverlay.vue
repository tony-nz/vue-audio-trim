<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isVisible" class="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <!-- Fade notification card -->
      <div class="bg-dark-player border border-dark-player-border rounded-2xl shadow-2xl p-6 mx-4 max-w-sm pointer-events-auto">
        <div class="flex items-center space-x-4">
          <!-- Animated icon -->
          <div class="flex-shrink-0">
            <div class="relative w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
              <!-- Fade In Icon -->
              <svg 
                v-if="fadeType === 'in'" 
                class="w-6 h-6 text-green-500 animate-pulse"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <path
                  d="M1 20c-.552 0-1-.446-1-.998v-4.215a1 1 0 0 1 1-1h.294c2.74.005 4.094-.163 5.705-.937 1.931-.927 3.601-2.653 5.035-5.476 1.37-2.697 2.882-4.55 4.583-5.718C18.64.267 20.274-.014 23.547.001H24a1 1 0 0 1 1 1V19.01c0 .552-.448.99-1 .99H1Z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M1 15.787a1 1 0 1 1 0-2h.294c2.74.005 4.094-.163 5.705-.937 1.931-.927 3.601-2.653 5.035-5.476 1.37-2.697 2.882-4.55 4.583-5.718C18.64.267 20.274-.014 23.547.001H24a1 1 0 1 1 0 2h-.462c-2.893-.013-4.197.211-5.79 1.304-1.402.962-2.702 2.558-3.93 4.975-1.626 3.199-3.607 5.247-5.953 6.373-1.962.942-3.55 1.14-6.574 1.134H1Z"
                  fill="currentColor"
                />
              </svg>
              
              <!-- Fade Out Icon -->
              <svg 
                v-else-if="fadeType === 'out'" 
                class="w-6 h-6 text-green-500 animate-pulse"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <path
                  d="M24 20c.552 0 1-.446 1-.998v-4.215a1 1 0 0 0-1-1h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 0 0-1 1V19.01c0 .552.448.99 1 .99H24Z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M24 15.787a1 1 0 1 0 0-2h-.294c-2.74.005-4.094-.163-5.705-.937-1.931-.927-3.601-2.653-5.035-5.476-1.37-2.697-2.882-4.55-4.583-5.718C6.36.267 4.726-.014 1.453.001H1a1 1 0 1 0 0 2h.462c2.893-.013 4.197.211 5.79 1.304 1.402.962 2.702 2.558 3.93 4.975 1.626 3.199 3.607 5.247 5.953 6.373 1.962.942 3.55 1.14 6.574 1.134H24Z"
                  fill="currentColor"
                />
              </svg>
              
              <!-- Settings Icon -->
              <svg 
                v-else 
                class="w-6 h-6 text-green-500 animate-pulse"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              
              <!-- Animated ring -->
              <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-green-500 animate-spin"></div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1">
            <h3 class="text-white font-medium text-sm">
              {{ title }}
            </h3>
            <p class="text-gray-400 text-xs mt-1">
              {{ message }}
            </p>
          </div>
          
          <!-- Success checkmark -->
          <div class="flex-shrink-0">
            <div class="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  fadeType: 'in' | 'out' | 'settings' | null;
  isEnabled?: boolean;
  duration?: number;
}>();

const title = computed(() => {
  if (props.fadeType === 'in') {
    return props.isEnabled ? 'Fade In Applied' : 'Fade In Disabled';
  } else if (props.fadeType === 'out') {
    return props.isEnabled ? 'Fade Out Applied' : 'Fade Out Disabled';
  } else if (props.fadeType === 'settings') {
    return 'Fade Settings Updated';
  }
  return 'Fade Applied';
});

const message = computed(() => {
  if (props.fadeType === 'in') {
    return props.isEnabled 
      ? `${props.duration}s fade in effect active`
      : 'Fade in effect removed';
  } else if (props.fadeType === 'out') {
    return props.isEnabled 
      ? `${props.duration}s fade out effect active`
      : 'Fade out effect removed';
  } else if (props.fadeType === 'settings') {
    return 'Fade durations have been updated';
  }
  return 'Fade effect applied to waveform';
});
</script>
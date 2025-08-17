<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <!-- Export card -->
      <div class="relative bg-dark-player border border-dark-player-border rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="mb-4">
            <!-- Animated export icon -->
            <div class="relative mx-auto w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center">
              <svg 
                class="w-8 h-8 text-green-500"
                :class="{ 'animate-bounce': isExporting }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              
              <!-- Spinning ring for processing -->
              <div 
                v-if="isExporting"
                class="absolute inset-0 rounded-full border-2 border-transparent border-t-green-500 animate-spin"
              ></div>
            </div>
          </div>
          
          <h3 class="text-xl font-bold text-white mb-2">
            {{ statusTitle }}
          </h3>
          
          <p class="text-gray-400 text-sm">
            {{ statusMessage }}
          </p>
        </div>

        <!-- Progress section -->
        <div v-if="isExporting || isBackgroundProcessing" class="mb-6">
          <!-- Progress bar -->
          <div class="relative mb-3">
            <div class="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
          </div>
          
          <!-- Progress text -->
          <div class="flex justify-between text-xs text-gray-400">
            <span>{{ progressLabel }}</span>
            <span>{{ Math.round(progress) }}%</span>
          </div>
        </div>

        <!-- Format info -->
        <div class="text-center">
          <div class="inline-flex items-center space-x-2 bg-dark-player-light rounded-full px-4 py-2">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span class="text-sm font-medium text-white uppercase">{{ format }}</span>
            <span v-if="formatBadge" class="text-xs text-gray-400">{{ formatBadge }}</span>
          </div>
        </div>

        <!-- Success state -->
        <div v-if="isCompleted" class="mt-6 text-center">
          <div class="text-green-500 mb-2">
            <svg class="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm text-gray-400">Export completed successfully!</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  isExporting: boolean;
  isBackgroundProcessing: boolean;
  backgroundProgress: number;
  format: string;
}>();

const progress = computed(() => {
  if (props.isExporting) {
    return props.isBackgroundProcessing ? 50 + (props.backgroundProgress * 0.5) : 100;
  }
  return props.isBackgroundProcessing ? props.backgroundProgress : 0;
});

const isCompleted = computed(() => 
  !props.isExporting && !props.isBackgroundProcessing && progress.value === 100
);

const statusTitle = computed(() => {
  if (isCompleted.value) return 'Export Complete!';
  if (props.isBackgroundProcessing) return 'Converting to MP3...';
  if (props.isExporting) return 'Processing Audio...';
  return 'Exporting Audio';
});

const statusMessage = computed(() => {
  if (isCompleted.value) return 'Your file has been downloaded';
  if (props.isBackgroundProcessing) return 'Encoding audio in the background';
  if (props.isExporting) return 'Applying effects and preparing export';
  return 'Getting ready to export';
});

const progressLabel = computed(() => {
  if (props.isBackgroundProcessing) return 'MP3 Encoding';
  if (props.isExporting) return 'Processing';
  return 'Preparing';
});

const formatBadge = computed(() => {
  return props.format === 'wav' ? 'instant' : undefined;
});
</script>
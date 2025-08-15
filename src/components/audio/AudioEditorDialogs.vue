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
  </div>
</template>

<script setup lang="ts">
import BaseDialog from '../common/BaseDialog.vue';

defineProps<{
  dialog: any;
  isTempoLoading: boolean;
}>();

defineEmits<{
  close: [];
  'confirm-close': [];
}>();
</script>
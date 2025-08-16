<template>
  <Dialog
    :visible="modelValue"
    :header="title"
    :modal="true"
    :closable="!hideCloseIcon"
    :draggable="false"
    @update:visible="$emit('update:modelValue', $event)"
  >
    <div class="dialog-content">
      <slot />
    </div>

    <template #footer>
      <Button
        v-if="!hideCloseButton"
        label="Cancel"
        icon="pi pi-times"
        @click="$emit('close')"
        class="p-button-text"
      />
      <Button
        :label="confirmText"
        :icon="type === 'delete' ? 'pi pi-check' : 'pi pi-check'"
        :severity="type === 'delete' ? 'danger' : 'primary'"
        :loading="confirmLoading"
        :class="confirmClasses"
        @click="$emit('confirm')"
        autofocus
      />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

export default defineComponent({
  name: "BaseDialog",

  components: {
    Dialog,
    Button,
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "default",
    },
    confirmText: {
      type: String,
      default: "Confirm",
    },
    confirmClasses: {
      type: String,
      default: "",
    },
    confirmLoading: {
      type: Boolean,
      default: false,
    },
    hideCloseButton: {
      type: Boolean,
      default: false,
    },
    hideCloseIcon: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue", "close", "confirm"],
});
</script>

<style scoped>
.dialog-content {
  padding: 1rem 0;
}
</style>

<template>
  <div @click="browseFile">
    <input
      v-if="active"
      ref="fileInput"
      class="hidden"
      type="file"
      name="image"
      :accept="accept"
      @change="setImage"
    />
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

interface EventTargetWithResult extends EventTarget {
  result: string;
}

export default defineComponent({
  name: "CommonUploader",

  props: {
    active: {
      type: Boolean,
      default: true,
    },

    accept: {
      type: String,
      default: "image/*",
    },
  },

  emits: ["set-file", "set-file-duration"],

  setup(props, { emit }) {
    const fileInput = ref<HTMLInputElement | null>(null);
    function browseFile() {
      if (props.active) fileInput.value?.click();
    }

    function setImage($event: Event) {
      const file = ($event.target as HTMLInputElement)?.files?.[0];
      if (!file) return;
      if (file.type.indexOf(props.accept.split("/")[0]) === -1) return;
      if (typeof FileReader !== "function")
        alert("Sorry, FileReader API not supported");

      const audio = document.createElement("audio");
      const reader = new FileReader();

      reader.onload = ($event: Event) => {
        const target = $event.target as EventTargetWithResult;
        audio.src = target.result;
        audio.addEventListener(
          "loadedmetadata",
          () => {
            const duration = parseInt(String(audio.duration));
            emit("set-file-duration", duration);
            emit("set-file", file);
          },
          false
        );
      };

      reader.readAsDataURL(file);
    }

    return {
      fileInput,
      browseFile,

      setImage,
    };
  },
});
</script>

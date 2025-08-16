import { ref } from "vue";

export default function useDialog() {
  const openedName = ref("");

  function open(name: string) {
    openedName.value = name;
  }

  function close() {
    openedName.value = "";
  }

  return {
    openedName,
    open,
    close,
  };
}

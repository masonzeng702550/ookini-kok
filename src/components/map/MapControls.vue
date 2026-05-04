<script setup lang="ts">
defineEmits<{
  'zoom-in': [];
  'zoom-out': [];
  reset: [];
}>();
</script>

<template>
  <div
    class="absolute right-4 bottom-4 z-30 flex flex-col gap-2.5 sm:right-6 sm:bottom-6"
  >
    <button
      class="w-11 h-11 paper-panel rounded-full grid place-items-center text-ink hover:text-neon-pink hover:border-neon-pink/60 hover:shadow-neon-pink transition-all"
      aria-label="Zoom in"
      @click="$emit('zoom-in')"
    >
      <span class="material-symbols-outlined">add</span>
    </button>
    <button
      class="w-11 h-11 paper-panel rounded-full grid place-items-center text-ink hover:text-neon-pink hover:border-neon-pink/60 hover:shadow-neon-pink transition-all"
      aria-label="Zoom out"
      @click="$emit('zoom-out')"
    >
      <span class="material-symbols-outlined">remove</span>
    </button>
    <button
      class="w-11 h-11 paper-panel rounded-full grid place-items-center text-ink hover:text-neon-pink hover:border-neon-pink/60 hover:shadow-neon-pink transition-all mt-2"
      aria-label="Reset view"
      @click="$emit('reset')"
    >
      <span class="material-symbols-outlined">my_location</span>
    </button>
  </div>
</template>

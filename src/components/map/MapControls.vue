<script setup lang="ts">
import { useBreakpoint } from '@/composables/useBreakpoint';

defineEmits<{
  'zoom-in': [];
  'zoom-out': [];
  reset: [];
}>();

const { isMobile } = useBreakpoint();
</script>

<template>
  <!-- Mobile: reset only, on the left side opposite the FAB. Pinch-zoom is
       universally known so the +/- buttons just steal map real estate. -->
  <div
    v-if="isMobile"
    class="absolute left-3 z-30"
    style="bottom: 5.5rem;"
  >
    <button
      class="w-11 h-11 paper-panel rounded-full grid place-items-center text-ink shadow-md active:scale-95 transition-transform"
      aria-label="回到關西全景"
      @click="$emit('reset')"
    >
      <span class="material-symbols-outlined">my_location</span>
    </button>
  </div>

  <!-- Desktop: full stack on the right -->
  <div
    v-else
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

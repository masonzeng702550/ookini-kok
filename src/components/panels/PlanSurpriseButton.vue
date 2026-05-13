<script setup lang="ts">
import { surpriseMe } from '@/data/planner';
import { useMapStore } from '@/stores/map';

const props = defineProps<{
  dayCount: number;
}>();

const store = useMapStore();

function onSurprise() {
  store.setItinerary(surpriseMe(props.dayCount));
}
</script>

<template>
  <button
    type="button"
    class="w-full py-3 rounded-lg bg-neon-cyan/10 text-ink font-bold text-sm border-2 border-dashed border-neon-cyan hover:bg-neon-cyan/20 transition"
    @click="onSurprise"
  >
    <span class="align-middle mr-1">🎲</span>
    為我驚喜
  </button>
</template>

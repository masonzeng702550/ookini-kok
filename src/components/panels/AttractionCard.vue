<script setup lang="ts">
import type { Attraction } from '@/types';
import PhotoImage from '@/components/ui/PhotoImage.vue';
import NeonChip from '@/components/ui/NeonChip.vue';

defineProps<{ attraction: Attraction; active?: boolean }>();
defineEmits<{ click: [id: string] }>();
</script>

<template>
  <button
    class="group w-full text-left p-3 rounded-xl border transition-all"
    :class="
      active
        ? 'border-neon-pink/70 bg-neon-pink/10 shadow-paper'
        : 'border-line bg-paper-soft hover:border-neon-pink/40 hover:bg-paper-warm hover:shadow-paper'
    "
    @click="$emit('click', attraction.id)"
  >
    <div class="flex gap-3">
      <div class="w-20 h-20 shrink-0">
        <PhotoImage
          :src="attraction.photo.thumb"
          :alt="attraction.photo.alt"
          ratio="1/1"
          rounded="lg"
        />
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="font-epilogue font-bold text-base text-ink truncate">
          {{ attraction.name_zh }}
        </h4>
        <p class="font-body text-xs text-ink-soft mt-0.5 line-clamp-2">
          {{ attraction.shortDesc }}
        </p>
        <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
          <NeonChip
            v-if="attraction.tags?.includes('top-rated')"
            small
            variant="pink"
            >Top</NeonChip
          >
          <NeonChip
            v-if="attraction.tags?.includes('photogenic')"
            small
            variant="cyan"
            >Photogenic</NeonChip
          >
          <NeonChip
            v-if="attraction.tags?.includes('family')"
            small
            variant="green"
            >Family</NeonChip
          >
          <span
            v-if="attraction.nearestStation"
            class="font-label text-[10px] tracking-widest text-ink-faint truncate inline-flex items-center gap-0.5"
          >
            <span class="material-symbols-outlined text-[12px] align-middle"
              >train</span
            >
            {{ attraction.nearestStation }}
          </span>
        </div>
      </div>
    </div>
  </button>
</template>

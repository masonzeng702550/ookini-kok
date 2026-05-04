<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  src: string;
  alt: string;
  ratio?: '16/9' | '1/1' | '4/3' | '3/2';
  credit?: string;
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
}

const props = withDefaults(defineProps<Props>(), {
  ratio: '16/9',
  rounded: 'lg',
});

const loaded = ref(false);
const errored = ref(false);
const fallback = '/photos/_placeholder.svg';
</script>

<template>
  <figure
    class="relative overflow-hidden bg-paper-warm border border-line"
    :class="[
      `rounded-${props.rounded}`,
      props.ratio === '16/9' ? 'aspect-video' :
      props.ratio === '1/1' ? 'aspect-square' :
      props.ratio === '4/3' ? 'aspect-[4/3]' : 'aspect-[3/2]'
    ]"
  >
    <img
      :src="errored ? fallback : props.src"
      :alt="props.alt"
      loading="lazy"
      decoding="async"
      class="w-full h-full object-cover transition-opacity duration-300"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      @load="loaded = true"
      @error="errored = true; loaded = true"
    />
    <div
      v-if="!loaded"
      class="absolute inset-0 grid place-items-center text-ink-faint"
    >
      <span class="material-symbols-outlined text-3xl">image</span>
    </div>
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/40 to-transparent"
    />
    <figcaption
      v-if="props.credit && props.credit !== 'placeholder'"
      class="absolute bottom-1 right-2 font-label text-[10px] tracking-widest text-white/85"
    >
      © {{ props.credit }}
    </figcaption>
  </figure>
</template>

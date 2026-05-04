<script setup lang="ts">
import type { City } from '@/types';
import CityIllustration from '@/components/ui/CityIllustration.vue';

interface Props {
  city: City;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
const props = withDefaults(defineProps<Props>(), { size: 'md' });
defineEmits<{ click: [city: City] }>();

const cityFill: Record<string, string> = {
  osaka: '#e63946',
  kyoto: '#b7295a',
  kobe: '#2a7da3',
  nara: '#6fbe3f',
  kix: '#ff7a00',
};
const fill = cityFill[props.city.id];

const sizeMap = {
  sm: { circle: 'w-10 h-10', icon: 22, label: 'text-[11px]' },
  md: { circle: 'w-14 h-14', icon: 32, label: 'text-sm' },
  lg: { circle: 'w-16 h-16', icon: 38, label: 'text-base' },
};
const sz = sizeMap[props.size];
</script>

<template>
  <div
    class="city-marker group cursor-pointer flex flex-col items-center select-none"
    @click.stop="$emit('click', city)"
  >
    <div
      class="rounded-full grid place-items-center transition-all duration-300 group-hover:scale-110"
      :class="[sz.circle, active ? 'neon-pulse scale-110' : '']"
      :style="{
        background: '#fffaee',
        border: `3px solid ${fill}`,
        boxShadow: active
          ? `0 0 16px ${fill}aa, 0 0 32px ${fill}55, 0 4px 10px rgba(58,47,36,0.18)`
          : `0 4px 12px rgba(58,47,36,0.18), 0 1px 0 rgba(255,255,255,0.9) inset`
      }"
    >
      <CityIllustration
        :id="city.id"
        :size="sz.icon"
        :style="{ color: fill }"
      />
    </div>
    <div
      class="mt-1.5 px-2 py-0.5 rounded-full font-epilogue font-extrabold tracking-tight whitespace-nowrap"
      :class="[sz.label]"
      :style="{
        color: '#fffaee',
        background: fill,
        boxShadow: '0 2px 6px rgba(58,47,36,0.25)'
      }"
    >
      {{ city.name_en }}
    </div>
  </div>
</template>

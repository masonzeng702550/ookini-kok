<script setup lang="ts">
interface Props {
  variant?: 'pink' | 'cyan' | 'green' | 'orange';
  small?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'pink',
  small: false,
});

const color: Record<NonNullable<Props['variant']>, string> = {
  pink: 'border-neon-pink/50 text-neon-pink bg-neon-pink/10',
  cyan: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10',
  green: 'border-neon-green/50 text-neon-green bg-neon-green/10',
  orange: 'border-neon-orange/50 text-neon-orange bg-neon-orange/10',
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1 border rounded-full font-label tracking-widest uppercase"
    :class="[
      color[props.variant],
      props.small ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    ]"
  >
    <slot />
  </span>
</template>

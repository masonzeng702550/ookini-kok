<script setup lang="ts">
import type { CityId } from '@/types';

defineProps<{ id: CityId; size?: number }>();
</script>

<template>
  <!-- Custom illustrative SVG icons referencing each city's signature.
       Stroke-based; flat fill kept simple so they render crisply at any size. -->
  <!-- OSAKA: Osaka Castle silhouette with gold accent -->
  <svg
    v-if="id === 'osaka'"
    :width="size ?? 40"
    :height="size ?? 40"
    viewBox="0 0 64 64"
    fill="none"
  >
    <!-- castle base -->
    <path d="M14 50h36v6H14z" fill="currentColor" />
    <!-- castle body -->
    <path
      d="M18 38h28v12H18z M16 36l16-4 16 4v2H16z"
      fill="currentColor"
    />
    <!-- top tier -->
    <path d="M22 28h20v8H22z M20 26l12-4 12 4v2H20z" fill="currentColor" />
    <!-- roof -->
    <path d="M26 18h12v8H26z M24 16l8-6 8 6v2H24z" fill="currentColor" />
    <!-- finial -->
    <circle cx="32" cy="9" r="2" fill="#ffd93d" stroke="currentColor" stroke-width="1.4" />
    <!-- windows -->
    <rect x="29" y="42" width="6" height="6" fill="#faf3e3" />
    <rect x="20" y="42" width="3" height="4" fill="#faf3e3" />
    <rect x="41" y="42" width="3" height="4" fill="#faf3e3" />
  </svg>

  <!-- KYOTO: Torii gate -->
  <svg
    v-else-if="id === 'kyoto'"
    :width="size ?? 40"
    :height="size ?? 40"
    viewBox="0 0 64 64"
    fill="none"
  >
    <!-- top crossbeam -->
    <path d="M6 14h52l-4 6H10z" fill="currentColor" />
    <!-- secondary beam -->
    <rect x="14" y="22" width="36" height="4" fill="currentColor" />
    <!-- pillars -->
    <rect x="16" y="26" width="6" height="32" fill="currentColor" />
    <rect x="42" y="26" width="6" height="32" fill="currentColor" />
    <!-- tablet -->
    <rect x="28" y="22" width="8" height="8" fill="#faf3e3" stroke="currentColor" stroke-width="1.5" />
  </svg>

  <!-- KOBE: Port tower (鼓型) -->
  <svg
    v-else-if="id === 'kobe'"
    :width="size ?? 40"
    :height="size ?? 40"
    viewBox="0 0 64 64"
    fill="none"
  >
    <!-- base -->
    <rect x="22" y="54" width="20" height="6" fill="currentColor" />
    <!-- bottom legs -->
    <path d="M24 24 L20 54 L28 54 L30 36 Z" fill="currentColor" />
    <path d="M40 24 L44 54 L36 54 L34 36 Z" fill="currentColor" />
    <!-- middle waist -->
    <rect x="29" y="34" width="6" height="6" fill="currentColor" />
    <!-- top observation deck -->
    <ellipse cx="32" cy="22" rx="11" ry="4" fill="currentColor" />
    <ellipse cx="32" cy="20" rx="9" ry="3" fill="currentColor" />
    <!-- spire -->
    <rect x="31" y="6" width="2" height="14" fill="currentColor" />
    <circle cx="32" cy="5" r="2.5" fill="#ffd93d" stroke="currentColor" stroke-width="1.4" />
  </svg>

  <!-- NARA: Deer silhouette -->
  <svg
    v-else-if="id === 'nara'"
    :width="size ?? 40"
    :height="size ?? 40"
    viewBox="0 0 64 64"
    fill="none"
  >
    <!-- antlers -->
    <path
      d="M18 14 L22 8 M22 8 L20 14 M22 8 L24 12 M44 12 L42 6 M42 6 L40 12 M42 6 L46 10"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
    />
    <!-- head -->
    <ellipse cx="32" cy="22" rx="12" ry="10" fill="currentColor" />
    <!-- ears -->
    <ellipse cx="22" cy="14" rx="3" ry="5" fill="currentColor" transform="rotate(-25 22 14)" />
    <ellipse cx="42" cy="14" rx="3" ry="5" fill="currentColor" transform="rotate(25 42 14)" />
    <!-- body -->
    <path d="M14 36 Q14 50 24 54 L40 54 Q50 50 50 36 Z" fill="currentColor" />
    <!-- legs -->
    <rect x="20" y="50" width="4" height="10" fill="currentColor" />
    <rect x="40" y="50" width="4" height="10" fill="currentColor" />
    <!-- eye -->
    <circle cx="35" cy="22" r="1.5" fill="#faf3e3" />
  </svg>

  <!-- KIX: Plane on cloud -->
  <svg
    v-else-if="id === 'kix'"
    :width="size ?? 40"
    :height="size ?? 40"
    viewBox="0 0 64 64"
    fill="none"
  >
    <!-- plane body -->
    <path
      d="M10 36 L48 32 L56 30 Q60 30 60 33 Q60 36 56 36 L48 36 L44 44 L40 44 L42 36 L26 36 L20 42 L17 42 L19 36 L12 36 Z"
      fill="currentColor"
    />
    <!-- wing strip -->
    <path d="M30 28 L48 30 L48 32 L30 32 Z" fill="currentColor" opacity="0.8" />
    <!-- speed marks -->
    <path
      d="M6 30 L14 30 M4 34 L12 34"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.6"
    />
  </svg>
</template>

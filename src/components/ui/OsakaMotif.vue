<script setup lang="ts">
withDefaults(
  defineProps<{
    kind: 'glico' | 'takoyaki' | 'tsutenkaku' | 'kuidaore' | 'octopus' | 'lantern';
    size?: number;
    color?: string;
  }>(),
  { size: 32, color: '#FF007A' },
);
</script>

<template>
  <!-- Glico-runner silhouette: stylized arms-up runner -->
  <svg
    v-if="kind === 'glico'"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    :style="{ color }"
    fill="currentColor"
  >
    <!-- head -->
    <circle cx="34" cy="14" r="5" />
    <!-- raised arms forming the iconic 'V' -->
    <path
      d="M30 18 L20 4 L17 6 L26 22 Z M38 18 L52 6 L49 4 L34 22 Z"
    />
    <!-- torso -->
    <path d="M28 20 L40 20 L40 36 L28 36 Z" />
    <!-- racing stripes (Glico singlet) -->
    <rect x="29" y="22" width="10" height="2" fill="#fffaee" opacity="0.85" />
    <rect x="29" y="26" width="10" height="2" fill="#fffaee" opacity="0.85" />
    <!-- shorts -->
    <path d="M28 36 L40 36 L41 44 L27 44 Z" opacity="0.85" />
    <!-- legs in stride -->
    <path d="M27 44 L22 60 L27 60 L31 46 Z" />
    <path d="M41 44 L46 58 L41 60 L37 46 Z" />
    <!-- finish-line baseline -->
    <path
      d="M8 60 L56 60"
      stroke="currentColor"
      stroke-width="1.5"
      opacity="0.4"
    />
  </svg>

  <!-- Takoyaki ball with toothpick -->
  <svg
    v-else-if="kind === 'takoyaki'"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    :style="{ color }"
  >
    <!-- ball -->
    <circle cx="32" cy="36" r="20" fill="#d9a04d" />
    <!-- shine -->
    <ellipse cx="24" cy="28" rx="5" ry="3" fill="#f4d790" opacity="0.7" />
    <!-- sauce drip -->
    <path
      d="M14 24 Q22 18 32 22 Q42 26 52 22 Q50 32 38 30 Q26 28 14 24 Z"
      fill="#3a2f24"
      opacity="0.85"
    />
    <!-- bonito flakes (lines on top) -->
    <path
      d="M22 16 L24 22 M30 14 L30 20 M38 15 L36 21 M44 18 L42 23"
      stroke="#fffaee"
      stroke-width="1.6"
      stroke-linecap="round"
      opacity="0.9"
    />
    <!-- toothpick -->
    <rect
      x="31"
      y="6"
      width="2"
      height="14"
      fill="currentColor"
      transform="rotate(15 32 13)"
    />
  </svg>

  <!-- Tsutenkaku tower -->
  <svg
    v-else-if="kind === 'tsutenkaku'"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    :style="{ color }"
    fill="currentColor"
  >
    <rect x="22" y="56" width="20" height="6" />
    <path d="M28 30 L26 56 L38 56 L36 30 Z" />
    <path d="M22 22 L24 30 L40 30 L42 22 Z" />
    <path d="M26 14 L24 22 L40 22 L38 14 Z" />
    <rect x="30" y="6" width="4" height="8" />
    <rect x="29" y="2" width="6" height="4" />
    <circle cx="32" cy="2" r="2" fill="#ffd93d" stroke="currentColor" stroke-width="1" />
  </svg>

  <!-- Kuidaore taro doll silhouette -->
  <svg
    v-else-if="kind === 'kuidaore'"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    :style="{ color }"
    fill="currentColor"
  >
    <!-- striped hat -->
    <path d="M22 4 L24 18 L40 18 L42 4 Z" />
    <rect x="23" y="8" width="18" height="2" fill="#fffaee" />
    <rect x="23" y="13" width="18" height="2" fill="#fffaee" />
    <!-- face -->
    <circle cx="32" cy="26" r="8" fill="#f4ebd4" stroke="currentColor" stroke-width="1.5" />
    <circle cx="29" cy="25" r="1" fill="currentColor" />
    <circle cx="35" cy="25" r="1" fill="currentColor" />
    <!-- body -->
    <path d="M22 36 L42 36 L40 60 L24 60 Z" />
  </svg>

  <!-- Stylized octopus (squid/tako) -->
  <svg
    v-else-if="kind === 'octopus'"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    :style="{ color }"
    fill="currentColor"
  >
    <path
      d="M32 6 C18 6 12 18 14 28 C15 32 20 32 22 30 L22 50 Q26 56 22 60 L26 60 Q30 54 28 48 L28 42 Q32 46 32 52 L32 58 L36 58 L36 50 Q40 46 40 40 L40 32 Q42 36 46 36 L46 50 Q42 54 46 58 L50 58 Q52 52 50 46 L50 30 C52 32 56 32 56 28 C58 18 50 6 32 6 Z"
    />
    <circle cx="26" cy="20" r="2" fill="#fffaee" />
    <circle cx="38" cy="20" r="2" fill="#fffaee" />
    <circle cx="26" cy="20" r="1" fill="currentColor" />
    <circle cx="38" cy="20" r="1" fill="currentColor" />
  </svg>

  <!-- Paper lantern (chochin) -->
  <svg
    v-else-if="kind === 'lantern'"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    :style="{ color }"
  >
    <!-- string -->
    <path d="M32 4 L32 10" stroke="currentColor" stroke-width="2" />
    <!-- top cap -->
    <rect x="22" y="8" width="20" height="6" fill="currentColor" />
    <!-- body -->
    <ellipse cx="32" cy="34" rx="20" ry="22" fill="#e63946" />
    <!-- horizontal ribs -->
    <path
      d="M14 24 Q32 28 50 24 M12 34 Q32 38 52 34 M14 44 Q32 48 50 44"
      stroke="#fffaee"
      stroke-width="1.4"
      fill="none"
      opacity="0.8"
    />
    <!-- bottom cap -->
    <rect x="22" y="54" width="20" height="6" fill="currentColor" />
    <!-- tassel -->
    <path d="M32 60 L32 64" stroke="currentColor" stroke-width="2" />
  </svg>
</template>

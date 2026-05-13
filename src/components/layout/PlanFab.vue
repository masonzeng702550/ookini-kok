<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMapStore } from '@/stores/map';
import { useBreakpoint } from '@/composables/useBreakpoint';
import PlanPanel from '@/components/panels/PlanPanel.vue';

const store = useMapStore();
const { isMobile } = useBreakpoint();
const open = ref(false);

// Pulse on first plan generation completes — sneaky little reminder it exists
const justGenerated = ref(false);
watch(
  () => store.itinerary,
  (it) => {
    if (it && !open.value) {
      justGenerated.value = true;
      setTimeout(() => (justGenerated.value = false), 2500);
    }
  },
);

function toggle() {
  open.value = !open.value;
}

const dialogClass = computed(() =>
  isMobile.value
    ? 'fixed left-3 right-3 bottom-20 max-h-[70vh] rounded-2xl'
    : 'fixed right-5 bottom-24 w-[380px] max-h-[78vh] rounded-2xl',
);
</script>

<template>
  <!-- Floating panel (chat-style) -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-3 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-3 scale-95"
  >
    <section
      v-if="open"
      :class="['z-50 paper-panel-strong flex flex-col overflow-hidden', dialogClass]"
      style="
        box-shadow: 0 20px 50px -10px rgba(58,47,36,0.35),
                    0 8px 16px rgba(122,92,56,0.18);
        border: 1px solid var(--line);
        transform-origin: bottom right;
      "
    >
      <header
        class="flex items-center justify-between px-4 py-2.5 border-b border-line"
        style="background: linear-gradient(135deg, #ff007a 0%, #ff4b8a 100%);"
      >
        <div class="flex items-center gap-2 text-white">
          <span class="material-symbols-outlined filled text-[20px]">route</span>
          <div>
            <div class="font-display font-extrabold text-sm tracking-tight leading-none">
              行程助理
            </div>
            <div class="font-label text-[9px] tracking-widest opacity-85 mt-0.5">
              PLANNER
            </div>
          </div>
        </div>
        <button
          class="text-white/90 hover:text-white p-1 -mr-1 rounded hover:bg-white/15 transition"
          aria-label="關閉"
          @click="open = false"
        >
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto">
        <PlanPanel />
      </div>
    </section>
  </transition>

  <!-- Floating action button -->
  <button
    class="fixed right-5 bottom-5 z-50 group"
    :class="open ? 'pointer-events-none opacity-0 scale-90' : 'opacity-100 scale-100'"
    style="transition: opacity 180ms ease, transform 180ms ease;"
    aria-label="開啟行程規劃"
    @click="toggle"
  >
    <span
      v-if="justGenerated"
      class="absolute inset-0 rounded-full animate-ping"
      style="background: rgba(255, 0, 122, 0.4);"
    ></span>
    <span
      class="relative flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full text-white font-bold shadow-xl transition-transform group-hover:scale-105"
      style="
        background: linear-gradient(135deg, #ff007a 0%, #ff4b8a 100%);
        box-shadow: 0 10px 30px -6px rgba(255,0,122,0.55),
                    0 4px 10px rgba(58,47,36,0.25);
      "
    >
      <span class="material-symbols-outlined filled text-[22px]">route</span>
      <span class="text-sm tracking-wide">規劃行程</span>
    </span>
  </button>
</template>

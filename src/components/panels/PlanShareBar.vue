<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Itinerary } from '@/types';
import { buildShareUrl } from '@/utils/itinerary-share';

const props = defineProps<{ itinerary: Itinerary | null }>();

const disabled = computed(() => props.itinerary === null);
const toastVisible = ref(false);
let toastTimer: number | undefined;

function showToast() {
  toastVisible.value = true;
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false;
  }, 2000);
}

async function onShare() {
  if (disabled.value) return;
  const url = buildShareUrl(props.itinerary);
  // Prefer native share, fall back to clipboard.
  const nav = navigator as Navigator & {
    share?: (data: { url: string }) => Promise<void>;
  };
  if (typeof nav.share === 'function') {
    try {
      await nav.share({ url });
      return;
    } catch {
      // user cancelled or share failed — fall through to clipboard.
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast();
  } catch {
    // ignore — nothing we can do without permissions.
  }
}

function onPrint() {
  if (disabled.value) return;
  window.print();
}
</script>

<template>
  <div class="relative flex items-center gap-2">
    <button
      type="button"
      class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-line bg-paper-soft text-ink hover:bg-paper transition disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="disabled"
      aria-label="分享行程"
      title="分享行程"
      @click="onShare"
    >
      <span class="material-symbols-outlined text-[18px]">share</span>
    </button>
    <button
      type="button"
      class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-line bg-paper-soft text-ink hover:bg-paper transition disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="disabled"
      aria-label="列印行程"
      title="列印行程"
      @click="onPrint"
    >
      <span class="material-symbols-outlined text-[18px]">print</span>
    </button>

    <transition name="fade">
      <div
        v-if="toastVisible"
        class="absolute -top-9 left-0 px-2.5 py-1 rounded-md bg-ink text-white text-[11px] font-label tracking-wide whitespace-nowrap shadow"
        role="status"
      >
        URL 已複製到剪貼簿
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

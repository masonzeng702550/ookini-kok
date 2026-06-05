<script setup lang="ts">
import { computed } from 'vue';
import { useMapStore } from '@/stores/map';
import { CITIES } from '@/data/cities';
import OsakaMotif from '@/components/ui/OsakaMotif.vue';
import type { CityId } from '@/types';

const store = useMapStore();
const cities = CITIES;

defineEmits<{
  'select-city': [id: CityId];
  'toggle-drawer': [];
}>();

const isActive = (id: CityId) => computed(() => store.activeCityId === id);
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 h-16 px-3 sm:px-6 flex items-center justify-between paper-panel-strong border-b border-line"
  >
    <div class="flex items-center gap-3 sm:gap-7 min-w-0">
      <button
        class="md:hidden p-2 rounded-full text-neon-pink hover:bg-paper-soft transition"
        aria-label="開啟側欄"
        @click="$emit('toggle-drawer')"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>

      <div class="flex items-center gap-2 min-w-0">
        <OsakaMotif kind="glico" :size="36" class="hidden sm:block shrink-0" />
        <h1
          class="font-epilogue font-black text-lg sm:text-2xl tracking-tight text-neon-pink text-neon-glow-primary truncate"
        >
          おおきに&nbsp;KOK！
        </h1>
      </div>

      <nav class="hidden md:flex items-center gap-5 h-full">
        <button
          v-for="c in cities"
          :key="c.id"
          class="font-epilogue tracking-tight font-bold h-full px-1 transition-all"
          :class="
            isActive(c.id).value
              ? 'text-neon-pink text-neon-glow-primary border-b-2 border-neon-pink'
              : 'text-ink-soft hover:text-ink'
          "
          @click="$emit('select-city', c.id)"
        >
          {{ c.name_en }}
        </button>
      </nav>

      <!-- Mobile-only horizontal-scroll pill row, fills the gap between title
           and the right-side icon buttons so cities are one tap away. -->
      <nav
        class="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar -mr-1 pl-1"
        style="scrollbar-width: none;"
      >
        <button
          v-for="c in cities"
          :key="c.id"
          class="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border transition-colors"
          :class="
            isActive(c.id).value
              ? 'bg-neon-pink text-white border-neon-pink'
              : 'bg-paper-soft text-ink-soft border-line'
          "
          @click="$emit('select-city', c.id)"
        >
          {{ c.name_en }}
        </button>
      </nav>
    </div>

    <div class="flex items-center gap-2 sm:gap-3">
      <div class="relative hidden sm:block">
        <input
          type="text"
          placeholder="搜尋景點 / 鐵路..."
          class="bg-paper-soft text-ink placeholder:text-ink-faint border border-line rounded-full px-3.5 py-1.5 w-48 lg:w-64 text-sm font-body focus:outline-none focus:border-neon-pink/70 transition-all"
        />
        <span
          class="material-symbols-outlined absolute right-2.5 top-1.5 text-ink-soft text-[20px]"
          >search</span
        >
      </div>
      <button
        class="p-2 rounded-full text-ink-soft hover:text-neon-pink hover:bg-paper-soft transition"
        :aria-label="store.theme === 'night' ? '切換到日間配色' : '切換到夜間配色'"
        :title="store.theme === 'night' ? '日間' : '夜間'"
        @click="store.toggleTheme()"
      >
        <span class="material-symbols-outlined filled">
          {{ store.theme === 'night' ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
      <button
        class="p-2 rounded-full text-ink-soft hover:text-neon-pink hover:bg-paper-soft transition"
        aria-label="設定"
      >
        <span class="material-symbols-outlined">settings</span>
      </button>
    </div>
  </header>
</template>

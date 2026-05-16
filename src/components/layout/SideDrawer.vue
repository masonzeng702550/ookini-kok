<script setup lang="ts">
import { computed } from 'vue';
import { useMapStore } from '@/stores/map';
import { useBreakpoint } from '@/composables/useBreakpoint';
import AreaDetailsPanel from '@/components/panels/AreaDetailsPanel.vue';
import AttractionsList from '@/components/panels/AttractionsList.vue';
import RailwayPanel from '@/components/panels/RailwayPanel.vue';
import FavoritesPanel from '@/components/panels/FavoritesPanel.vue';
import OsakaMotif from '@/components/ui/OsakaMotif.vue';
import type { DrawerTab } from '@/types';

const store = useMapStore();
const { isMobile } = useBreakpoint();

const tabs: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'area', label: 'Area', icon: 'public' },
  { id: 'attractions', label: 'Spots', icon: 'location_on' },
  { id: 'railways', label: 'Rail', icon: 'train' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'favorites', label: 'Saved', icon: 'favorite' },
];

const drawerClass = computed(() =>
  isMobile.value
    ? [
        'fixed left-0 right-0 bottom-0 z-40 max-h-[72vh] rounded-t-2xl',
        'transform transition-transform duration-300',
        store.drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]',
      ]
    : [
        'fixed top-16 left-0 bottom-0 z-40 w-80',
        'transform transition-transform duration-300',
        store.drawerOpen ? 'translate-x-0' : '-translate-x-full',
      ],
);
</script>

<template>
  <aside
    :class="['paper-panel-strong flex flex-col', drawerClass]"
    :style="
      isMobile
        ? 'box-shadow: 0 -10px 30px rgba(122,92,56,0.18);'
        : 'box-shadow: 8px 0 24px rgba(122,92,56,0.15); border-right: 1px solid var(--line);'
    "
  >
    <button
      v-if="isMobile"
      class="h-10 w-full flex items-center justify-center"
      @click="store.toggleDrawer()"
    >
      <span class="w-12 h-1.5 bg-line rounded-full"></span>
    </button>

    <!-- Tab bar -->
    <div class="grid grid-cols-5 gap-1 px-2 pt-2 pb-1 border-b border-line">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="flex flex-col items-center gap-0.5 py-2 rounded-lg transition"
        :class="
          store.activeTab === t.id
            ? 'text-neon-pink bg-neon-pink/10'
            : 'text-ink-soft hover:bg-paper-soft hover:text-ink'
        "
        @click="store.setTab(t.id)"
      >
        <span
          class="material-symbols-outlined text-[22px]"
          :class="store.activeTab === t.id ? 'filled' : ''"
          >{{ t.icon }}</span
        >
        <span class="font-label text-[9px] tracking-widest uppercase">{{
          t.label
        }}</span>
      </button>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto">
      <AreaDetailsPanel v-if="store.activeTab === 'area'" />
      <AttractionsList v-else-if="store.activeTab === 'attractions'" />
      <RailwayPanel v-else-if="store.activeTab === 'railways'" />
      <FavoritesPanel v-else-if="store.activeTab === 'favorites'" />
      <div
        v-else
        class="px-6 py-10 text-center"
      >
        <OsakaMotif
          kind="kuidaore"
          :size="56"
          color="#d9a04d"
          class="mx-auto mb-3"
        />
        <p
          class="font-label text-[10px] tracking-widest text-ink-faint uppercase"
        >
          Coming soon
        </p>
      </div>
    </div>
  </aside>
</template>

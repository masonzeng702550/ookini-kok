<script setup lang="ts">
import { onMounted } from 'vue';
import TopAppBar from '@/components/layout/TopAppBar.vue';
import SideDrawer from '@/components/layout/SideDrawer.vue';
import KansaiMap from '@/components/map/KansaiMap.vue';
import { useMapStore } from '@/stores/map';
import { useBreakpoint } from '@/composables/useBreakpoint';
import type { CityId } from '@/types';

const store = useMapStore();
const { isMobile, isDesktop } = useBreakpoint();

function selectCity(id: CityId) {
  store.selectCity(id);
}

onMounted(() => {
  // Default: drawer closed on mobile, open on desktop.
  store.toggleDrawer(!isMobile.value);
});
</script>

<template>
  <div class="relative h-full overflow-hidden bg-paper">
    <TopAppBar @select-city="selectCity" @toggle-drawer="store.toggleDrawer()" />

    <!-- Map area -->
    <main
      class="absolute top-16 left-0 right-0 bottom-0 transition-[margin] duration-300"
      :style="
        isDesktop && store.drawerOpen ? 'margin-left: 20rem;' : 'margin-left: 0;'
      "
    >
      <KansaiMap />
    </main>

    <SideDrawer />
  </div>
</template>

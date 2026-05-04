import { onMounted, onUnmounted, ref, computed } from 'vue';

export function useBreakpoint() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const onResize = () => (width.value = window.innerWidth);
  onMounted(() => window.addEventListener('resize', onResize));
  onUnmounted(() => window.removeEventListener('resize', onResize));

  const isMobile = computed(() => width.value < 768);
  const isTablet = computed(() => width.value >= 768 && width.value < 1024);
  const isDesktop = computed(() => width.value >= 1024);

  return { width, isMobile, isTablet, isDesktop };
}

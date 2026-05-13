<script setup lang="ts">
import { computed } from 'vue';
import type { Itinerary } from '@/types';
import { recommendPass } from '@/data/passes';

const props = defineProps<{ itinerary: Itinerary }>();

const totals = computed(() => {
  let fareYen = 0;
  let walkMeters = 0;
  for (const day of props.itinerary.days) {
    for (const stop of day.stops) {
      if (!stop.commute) continue;
      fareYen += stop.commute.totalFareYen ?? 0;
      walkMeters += stop.commute.totalWalkMeters ?? 0;
    }
  }
  return { fareYen, walkMeters };
});

const recommendation = computed(() => recommendPass(props.itinerary));

const fareDisplay = computed(() =>
  totals.value.fareYen.toLocaleString('en-US'),
);
const walkKmDisplay = computed(() =>
  (totals.value.walkMeters / 1000).toFixed(1),
);
</script>

<template>
  <section
    class="border border-line rounded-xl bg-paper-soft overflow-hidden"
  >
    <header class="px-3 py-2 border-b border-line/70 bg-white/40">
      <h3 class="font-display text-sm font-extrabold tracking-tight text-ink">
        行程經濟摘要
      </h3>
      <p class="font-label text-[10px] tracking-widest text-ink-faint uppercase mt-0.5">
        Trip Economics
      </p>
    </header>

    <div class="divide-y divide-line/60">
      <!-- Total fare -->
      <div class="px-3 py-2.5 flex items-baseline gap-2">
        <span class="font-label text-[10px] tracking-widest text-ink-soft uppercase w-16">
          總車資
        </span>
        <span class="flex-1" />
        <span class="font-display text-2xl font-extrabold text-neon-pink leading-none">
          ¥{{ fareDisplay }}
        </span>
      </div>

      <!-- Walking distance -->
      <div class="px-3 py-2.5 flex items-center gap-2">
        <span class="font-label text-[10px] tracking-widest text-ink-soft uppercase w-16">
          總步行
        </span>
        <span class="flex-1" />
        <span class="material-symbols-outlined filled text-[18px] text-ink-soft">directions_walk</span>
        <span class="font-display text-xl font-extrabold text-ink leading-none">
          {{ walkKmDisplay }} km
        </span>
      </div>

      <!-- Pass recommendation -->
      <div class="px-3 py-2.5">
        <div class="font-label text-[10px] tracking-widest text-ink-soft uppercase mb-1">
          建議優惠票
        </div>
        <template v-if="recommendation.recommended">
          <div class="font-bold text-sm text-ink leading-tight">
            {{ recommendation.recommended.name_zh }}
          </div>
          <div class="text-[11px] text-ink-soft mt-0.5">
            售價 ¥{{ recommendation.recommended.priceYen.toLocaleString('en-US') }}
            ·
            <span class="text-neon-pink font-bold">
              省 ¥{{ recommendation.savingsYen.toLocaleString('en-US') }}
            </span>
          </div>
          <p class="text-[11px] text-ink-faint mt-1 leading-relaxed">
            {{ recommendation.recommended.coverage }}
          </p>
        </template>
        <template v-else>
          <div class="font-bold text-sm text-ink leading-tight">
            建議單買 ICOCA
          </div>
          <p class="text-[11px] text-ink-faint mt-1 leading-relaxed">
            此行程沒有任何優惠票能省錢，按距離儲值即可。
          </p>
        </template>
      </div>
    </div>

    <footer class="px-3 py-1.5 bg-white/30 border-t border-line/70">
      <p class="text-[10px] text-ink-faint leading-relaxed">
        車資以 ¥160 起 + 超出 3km 每公里 ¥30 估算，實際以官方為準。
      </p>
    </footer>
  </section>
</template>

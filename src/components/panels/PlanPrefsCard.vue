<script setup lang="ts">
import { computed } from 'vue';
import type { AttractionTag, PlannerPrefs } from '@/types';

const props = defineProps<{
  modelValue: PlannerPrefs;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: PlannerPrefs): void;
}>();

const THEMES: { id: NonNullable<PlannerPrefs['theme']>; label: string }[] = [
  { id: 'mix', label: '主題隨機' },
  { id: 'food', label: '美食' },
  { id: 'temple', label: '寺廟神社' },
  { id: 'family', label: '親子' },
  { id: 'photo', label: '攝影' },
];

const ALL_TAGS: { id: AttractionTag; label: string }[] = [
  { id: 'top-rated', label: '熱門' },
  { id: 'spicy', label: '辛辣' },
  { id: 'open-now', label: '營業中' },
  { id: 'family', label: '親子' },
  { id: 'photogenic', label: '上鏡' },
];

const prefs = computed(() => props.modelValue);

function update(patch: Partial<PlannerPrefs>) {
  emit('update:modelValue', { ...prefs.value, ...patch });
}

function setTheme(t: NonNullable<PlannerPrefs['theme']>) {
  update({ theme: t });
}

function toggleExcluded(tag: AttractionTag) {
  const cur = prefs.value.excludedTags ?? [];
  const i = cur.indexOf(tag);
  const next = i >= 0 ? cur.filter((_, idx) => idx !== i) : [...cur, tag];
  update({ excludedTags: next });
}

const walkKm = computed(() => prefs.value.maxWalkKm ?? 5);
const startTime = computed(() => prefs.value.startTime ?? '08:30');

function onWalkInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value);
  update({ maxWalkKm: v });
}

function onStartInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  update({ startTime: v });
}

function isThemeActive(t: NonNullable<PlannerPrefs['theme']>): boolean {
  const cur = prefs.value.theme ?? 'mix';
  return cur === t;
}

function isExcluded(tag: AttractionTag): boolean {
  return (prefs.value.excludedTags ?? []).includes(tag);
}
</script>

<template>
  <section class="space-y-3 p-3 border border-line rounded-lg bg-paper-soft">
    <header>
      <h3 class="font-display text-sm font-extrabold tracking-tight text-ink">
        偏好設定
      </h3>
      <p class="font-label text-[10px] tracking-widest text-ink-faint uppercase mt-0.5">
        Planner Preferences
      </p>
    </header>

    <!-- Theme -->
    <div>
      <label class="font-label text-[10px] tracking-widest text-ink-soft uppercase">
        主題
      </label>
      <div class="flex flex-wrap gap-1.5 mt-1.5">
        <button
          v-for="t in THEMES"
          :key="t.id"
          type="button"
          class="px-2.5 py-1 rounded-full text-xs font-bold border transition"
          :class="
            isThemeActive(t.id)
              ? 'bg-neon-cyan/15 border-neon-cyan text-ink'
              : 'bg-white border-line text-ink-soft hover:bg-paper'
          "
          @click="setTheme(t.id)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Excluded tags -->
    <div>
      <label class="font-label text-[10px] tracking-widest text-ink-soft uppercase">
        排除標籤
      </label>
      <div class="flex flex-wrap gap-1.5 mt-1.5">
        <button
          v-for="t in ALL_TAGS"
          :key="t.id"
          type="button"
          class="px-2.5 py-1 rounded-full text-xs font-bold border transition"
          :class="
            isExcluded(t.id)
              ? 'bg-neon-pink/15 border-neon-pink text-ink line-through'
              : 'bg-white border-line text-ink-soft hover:bg-paper'
          "
          @click="toggleExcluded(t.id)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Walk cap -->
    <div>
      <label class="font-label text-[10px] tracking-widest text-ink-soft uppercase flex justify-between">
        <span>每日最多步行</span>
        <span class="text-ink font-bold">{{ walkKm }} km</span>
      </label>
      <input
        type="range"
        min="1"
        max="15"
        step="1"
        :value="walkKm"
        class="w-full mt-1.5 accent-neon-cyan"
        @input="onWalkInput"
      />
    </div>

    <!-- Start time -->
    <div>
      <label class="font-label text-[10px] tracking-widest text-ink-soft uppercase">
        出發時間
      </label>
      <input
        type="text"
        :value="startTime"
        placeholder="08:30"
        class="mt-1.5 w-24 px-2 py-1 text-sm rounded border border-line bg-white text-ink focus:outline-none focus:border-neon-cyan"
        @input="onStartInput"
      />
    </div>
  </section>
</template>

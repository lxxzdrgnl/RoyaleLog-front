<template>
  <div class="wr-wrap">
    <div class="wr-bar">
      <div class="wr-fill" :style="{ width: `${Math.round(rate * 100)}%`, background: barColor }" />
    </div>
    <span class="wr-text" :style="{ color: barColor }">{{ Math.round(rate * 100) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ rate: number }>()
const barColor = computed(() => {
  if (props.rate >= 0.6) return 'var(--win)'
  if (props.rate >= 0.5) return '#f5c418'
  return 'var(--loss)'
})
</script>

<style scoped>
.wr-wrap { display: flex; align-items: center; gap: 8px; }
.wr-bar { width: 80px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.wr-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.wr-text { font-family: 'Rajdhani', sans-serif; font-size: 0.9rem; font-weight: 700; min-width: 36px; }
</style>

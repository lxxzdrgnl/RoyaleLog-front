<template>
  <div class="elixir-stat">
    <div class="stat-item">
      <div class="elixir-drop">💧</div>
      <span class="val">{{ leaked.toFixed(2) }}</span>
    </div>
    <div class="stat-item">
      <span class="hp-icon">🏰</span>
      <span class="val" :class="{ zero: hp === 0 }">{{ hp === 0 ? '파괴' : hp.toLocaleString() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ leaked: number; hp: number }>()
</script>

<style scoped>
.elixir-stat { display: flex; gap: 12px; align-items: center; }
.stat-item { display: flex; align-items: center; gap: 3px; }
.elixir-drop { font-size: 0.8rem; }
.hp-icon { font-size: 0.75rem; }
.val { font-family: 'Rajdhani', sans-serif; font-size: 0.8rem; font-weight: 600; color: var(--text-dim); }
.val.zero { color: var(--loss); }
</style>

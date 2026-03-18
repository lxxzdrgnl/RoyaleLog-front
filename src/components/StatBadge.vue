<template>
  <div class="badge" :class="{ gold }">
    <span class="badge-icon">{{ icon }}</span>
    <div>
      <p class="badge-val">{{ value }}</p>
      <p class="badge-label">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; value: string; label: string; gold?: boolean }>()
</script>

<style scoped>
.badge {
  display: flex; align-items: center; gap: 6px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 6px 12px;
}
.badge.gold { border-color: rgba(245,196,24,0.4); background: rgba(245,196,24,0.08); }
.badge-icon { font-size: 1.1rem; }
.badge-val { font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; font-weight: 700; line-height: 1; }
.badge.gold .badge-val { color: var(--gold); }
.badge-label { font-family: 'Rajdhani', sans-serif; font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
</style>

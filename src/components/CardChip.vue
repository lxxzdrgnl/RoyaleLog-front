<template>
  <div class="chip" :class="`size-${size}`">
    <img
      :src="cardImage(card.name, card.evolutionLevel, card.starLevel ?? 0)"
      :alt="card.name"
      @error="(e: any) => e.target.src = card.iconUrl"
    />
    <span class="chip-level">{{ displayLevel(card.level, card.rarity ?? 'Common') }}</span>
    <span v-if="card.evolutionLevel > 0" class="chip-evo">⚡</span>
  </div>
</template>

<script setup lang="ts">
import { cardImage, displayLevel } from '@/utils/cardAsset'
defineProps<{
  card: { id: number; name: string; level: number; evolutionLevel: number; elixirCost: number; iconUrl: string; starLevel?: number; rarity?: string }
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<style scoped>
.chip {
  position: relative; background: var(--surface);
  border: 1px solid var(--border); border-radius: 6px; overflow: hidden;
}
.chip img { display: block; object-fit: cover; width: 100%; height: 100%; }
.chip-level {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,0.75); color: var(--gold);
  font-family: 'Rajdhani', sans-serif; font-size: 0.65rem; font-weight: 700;
  text-align: center; padding: 1px 0;
}
.chip-evo { position: absolute; top: 1px; right: 2px; font-size: 0.6rem; }
.size-sm { width: 36px; height: 42px; }
.size-md { width: 48px; height: 56px; }
.size-lg { width: 64px; height: 74px; }
</style>

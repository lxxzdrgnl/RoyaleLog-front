<template>
  <div class="battle" :class="isWin ? 'win' : 'loss'">
    <div class="battle-top">
      <span class="result-badge" :class="isWin ? 'win' : 'loss'">{{ isWin ? '승리' : '패배' }}</span>
      <span class="game-mode">{{ battle.gameMode?.name ?? battle.type }}</span>
      <span class="battle-time">{{ timeAgo(battle.battleTime) }}</span>
    </div>

    <div class="battle-body">
      <!-- MY SIDE -->
      <div class="side my-side">
        <div class="side-header">
          <span class="player-name">{{ me.name }}</span>
          <span v-if="me.clan" class="clan">{{ me.clan.name }}</span>
        </div>
        <div class="deck-row">
          <CardChip
            v-for="card in me.cards"
            :key="card.id"
            :card="{ id: card.id, name: card.name, level: card.level, evolutionLevel: card.evolutionLevel ?? 0, elixirCost: card.elixirCost ?? 0, starLevel: card.starLevel ?? 0, rarity: cardRarity(card.id), iconUrl: card.iconUrls?.medium ?? '' }"
            size="md"
          />
        </div>
        <div v-if="me.supportCards?.[0]" class="tower-row">
          <CardChip
            :card="{ id: me.supportCards[0].id, name: me.supportCards[0].name, level: me.supportCards[0].level, evolutionLevel: 0, elixirCost: 0, starLevel: 0, rarity: 'common', iconUrl: me.supportCards[0].iconUrls?.medium ?? '' }"
            size="sm"
          />
          <span class="tower-name">{{ me.supportCards[0].name }}</span>
        </div>
        <div class="elixir-row">
          <ElixirStat :leaked="me.elixirLeaked ?? 0" :hp="me.kingTowerHitPoints ?? 0" />
        </div>
      </div>

      <!-- CENTER -->
      <div class="center-col">
        <div class="crown-row">
          <span class="crown" :class="{ active: isWin }">{{ me.crowns }}</span>
          <span class="crown-sep">—</span>
          <span class="crown" :class="{ active: !isWin }">{{ opp.crowns }}</span>
        </div>
      </div>

      <!-- OPP SIDE -->
      <div class="side opp-side">
        <div class="side-header opp">
          <span class="player-name">{{ opp.name }}</span>
          <span v-if="opp.clan" class="clan">{{ opp.clan.name }}</span>
        </div>
        <div class="deck-row opp">
          <CardChip
            v-for="card in opp.cards"
            :key="card.id"
            :card="{ id: card.id, name: card.name, level: card.level, evolutionLevel: card.evolutionLevel ?? 0, elixirCost: card.elixirCost ?? 0, starLevel: card.starLevel ?? 0, rarity: cardRarity(card.id), iconUrl: card.iconUrls?.medium ?? '' }"
            size="md"
          />
        </div>
        <div v-if="opp.supportCards?.[0]" class="tower-row opp">
          <CardChip
            :card="{ id: opp.supportCards[0].id, name: opp.supportCards[0].name, level: opp.supportCards[0].level, evolutionLevel: 0, elixirCost: 0, starLevel: 0, rarity: 'common', iconUrl: opp.supportCards[0].iconUrls?.medium ?? '' }"
            size="sm"
          />
          <span class="tower-name">{{ opp.supportCards[0].name }}</span>
        </div>
        <div class="elixir-row opp">
          <ElixirStat :leaked="opp.elixirLeaked ?? 0" :hp="opp.kingTowerHitPoints ?? 0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BattleLog } from '@/api/player'
import { timeAgo } from '@/utils/cardAsset'
import CardChip from './CardChip.vue'
import ElixirStat from './ElixirStat.vue'

const props = defineProps<{ battle: BattleLog; myTag: string; rarityMap?: Map<number, string> }>()

function cardRarity(id: number): string {
  return props.rarityMap?.get(id) ?? 'common'
}

const me = computed(() => props.battle.team?.[0])
const opp = computed(() => props.battle.opponent?.[0])
const isWin = computed(() => (me.value?.crowns ?? 0) > (opp.value?.crowns ?? 0))
</script>

<style scoped>
.battle {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.battle.win { border-left-color: var(--win); }
.battle.loss { border-left-color: var(--loss); }

.battle-top {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid var(--border);
}

.result-badge {
  font-family: 'Rajdhani', sans-serif; font-size: 0.8rem; font-weight: 700;
  padding: 2px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;
}
.result-badge.win { background: rgba(46,204,113,0.2); color: var(--win); }
.result-badge.loss { background: rgba(231,76,60,0.2); color: var(--loss); }

.game-mode { font-family: 'Rajdhani', sans-serif; font-size: 0.85rem; font-weight: 600; color: var(--text-dim); }
.battle-time { font-family: 'Rajdhani', sans-serif; font-size: 0.8rem; color: var(--text-dim); margin-left: auto; }

.battle-body {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  gap: 8px;
  padding: 12px 14px;
  align-items: center;
}

.side { display: flex; flex-direction: column; gap: 5px; }
.opp-side { align-items: flex-end; }

.side-header { display: flex; gap: 6px; align-items: baseline; flex-wrap: wrap; }
.side-header.opp { flex-direction: row-reverse; }
.player-name { font-family: 'Rajdhani', sans-serif; font-size: 0.9rem; font-weight: 700; }
.clan { font-family: 'Rajdhani', sans-serif; font-size: 0.75rem; color: var(--text-dim); }

.deck-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 3px; width: 100%; }
.deck-row.opp { direction: rtl; }
.deck-row.opp :deep(.chip) { direction: ltr; }

.tower-row { display: flex; align-items: center; gap: 6px; }
.tower-row.opp { flex-direction: row-reverse; }
.tower-name { font-family: 'Rajdhani', sans-serif; font-size: 0.75rem; color: var(--text-dim); }

.elixir-row.opp { justify-content: flex-end; }

.center-col { display: flex; align-items: center; justify-content: center; }
.crown-row { display: flex; align-items: center; gap: 6px; }
.crown {
  font-family: 'Rajdhani', sans-serif; font-size: 1.6rem; font-weight: 700;
  color: var(--text-dim); width: 32px; text-align: center; line-height: 1;
}
.crown.active { color: var(--gold); }
.crown-sep { color: var(--text-dim); font-size: 0.8rem; }
</style>

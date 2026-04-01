<template>
  <!-- ── 대표 행 ── -->
  <tr
    class="deck-row"
    :class="{ expandable: hasVariants, expanded: isExpanded }"
    @click="hasVariants && (isExpanded = !isExpanded)"
  >
    <td class="rank-cell">{{ rank }}</td>
    <td class="tier-cell">
      <span v-if="group.tier" class="tier-badge" :class="`tier-${group.tier}`">{{ group.tier }}</span>
    </td>
    <td class="cards-cell">
      <div class="cards-cell-inner">
        <!-- 기본 8장 스트립 (진화 → 히어로 → 나머지 → 일반 순) -->
        <div class="card-strip">
          <div
            v-for="i in sortedIndices(group.representative)"
            :key="group.representative.cardIds[i]"
            class="card-thumb"
            :class="{
              'is-evo': isEvolved(group.representative, i),
              'is-hero': isHero(group.representative.cardIds[i])
            }"
          >
            <img
              :src="cardImg(group.representative.cardIds[i], group.representative.cardEvoLevels?.[i] ?? 0)"
              :alt="cardName(group.representative.cardIds[i])"
              :title="cardLabel(group.representative.cardIds[i], group.representative, i)"
              @error="(e: any) => { e.target.src = cardImg(group.representative.cardIds[i]) }"
            />
          </div>
        </div>

        <!-- 진화/히어로 카드 일러스트 강조 (진화→히어로 순, 최대 3장) -->
        <div v-if="featureCards.length" class="feature-strip">
          <div
            v-for="fc in featureCards"
            :key="fc.id + '-' + fc.evoLevel"
            class="feature-thumb"
            :class="{ 'is-evo': (fc.evoLevel & 1) > 0, 'is-hero': isHero(fc.id) || (fc.evoLevel & 2) > 0 }"
            :title="cardLabel(fc.id, group.representative, fc.index)"
          >
            <img
              :src="cardImg(fc.id, fc.evoLevel)"
              :alt="cardName(fc.id)"
              @error="(e: any) => { e.target.src = cardImg(fc.id) }"
            />
          </div>
        </div>

        <!-- 변형 토글 -->
        <div v-if="hasVariants" class="variant-toggle">
          <span class="variant-count-badge">+{{ group.variants.length - 1 }}종</span>
          <span class="expand-caret">{{ isExpanded ? '▲' : '▼' }}</span>
        </div>
      </div>
    </td>
    <td class="stat-cell">
      <span class="win-rate">{{ group.representative.winRate }}%</span>
    </td>
    <td class="stat-cell">
      <span class="score-badge">{{ group.representative.score }}</span>
    </td>
    <td class="stat-cell dim">{{ group.totalUseCount.toLocaleString() }}</td>
  </tr>

  <!-- ── 변형 행들 (확장 시) ── -->
  <tr
    v-if="isExpanded"
    v-for="variant in otherVariants"
    :key="variant.deckHash"
    class="variant-row"
  >
    <td class="rank-cell"></td>
    <td class="tier-cell"></td>
    <td class="cards-cell">
      <div class="cards-cell-inner variant-indent">
        <div class="card-strip card-strip-sm">
          <div
            v-for="i in sortedIndices(variant)"
            :key="variant.cardIds[i]"
            class="card-thumb card-thumb-sm"
            :class="{
              'is-evo': isEvolved(variant, i),
              'is-hero': isHero(variant.cardIds[i])
            }"
          >
            <img
              :src="cardImg(variant.cardIds[i], variant.cardEvoLevels?.[i] ?? 0)"
              :alt="cardName(variant.cardIds[i])"
              :title="cardLabel(variant.cardIds[i], variant, i)"
              @error="(e: any) => { e.target.src = cardImg(variant.cardIds[i]) }"
            />
          </div>
        </div>
        <!-- 변형 덱의 진화/히어로 강조 -->
        <div v-if="variantFeatureCards(variant).length" class="feature-strip feature-strip-sm">
          <div
            v-for="fc in variantFeatureCards(variant)"
            :key="fc.id + '-' + fc.evoLevel"
            class="feature-thumb feature-thumb-sm"
            :class="{ 'is-evo': (fc.evoLevel & 1) > 0, 'is-hero': isHero(fc.id) || (fc.evoLevel & 2) > 0 }"
          >
            <img
              :src="cardImg(fc.id, fc.evoLevel)"
              :alt="cardName(fc.id)"
              @error="(e: any) => { e.target.src = cardImg(fc.id) }"
            />
          </div>
        </div>
      </div>
    </td>
    <td class="stat-cell">
      <span class="win-rate">{{ variant.winRate }}%</span>
    </td>
    <td class="stat-cell">
      <span class="score-badge">{{ variant.score }}</span>
    </td>
    <td class="stat-cell dim">{{ variant.useCount.toLocaleString() }}</td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCardMetaStore } from '@/stores/cardMeta'
import { cardImage } from '@/utils/cardAsset'
import type { DeckGroup, DeckStatsResponse } from '@/api/tier'

const props = defineProps<{ group: DeckGroup; rank: number; tier?: string }>()
const metaStore = useCardMetaStore()
const isExpanded = ref(false)

const hasVariants = computed(() => props.group.variants.length > 1)
const otherVariants = computed(() => props.group.variants.slice(1))

/** 진화 → 히어로 순으로 정렬, 최대 3개 추출 */
const featureCards = computed(() => extractFeatureCards(props.group.representative))

function extractFeatureCards(deck: DeckStatsResponse) {
  const cards = deck.cardIds.map((id, index) => ({
    id, index, evoLevel: deck.cardEvoLevels?.[index] ?? 0
  }))
  const evo = cards.filter(c => (c.evoLevel & 1) > 0)                          // bit 0: 진화
  const hero = cards.filter(c => (c.evoLevel & 1) === 0 && (isHero(c.id) || (c.evoLevel & 2) > 0))  // 히어로/챔피언/히어로스킨
  // 1번: 진화, 2번: 히어로, 3번: 진화/히어로
  const result: typeof cards = []
  if (evo.length > 0) result.push(evo.shift()!)
  if (result.length < 3 && hero.length > 0) result.push(hero.shift()!)
  while (result.length < 3 && (evo.length > 0 || hero.length > 0)) {
    if (hero.length > 0) result.push(hero.shift()!)
    else if (evo.length > 0) result.push(evo.shift()!)
  }
  return result
}

function variantFeatureCards(deck: DeckStatsResponse) {
  return extractFeatureCards(deck)
}

function isEvolved(deck: DeckStatsResponse, cardIndex: number): boolean {
  return ((deck.cardEvoLevels?.[cardIndex] ?? 0) & 1) > 0
}

/** CHAMPION rarity (28000xxx Champion cards like Archer Queen) */
function isChampion(id: number): boolean {
  return metaStore.get(id)?.rarity?.toUpperCase() === 'CHAMPION'
}

/** 챔피언(rarity=CHAMPION)만 진짜 히어로 카드.
 *  cardType=HERO는 "히어로 일러스트 보유"를 뜻하며 Knight 등 일반 카드도 포함 → 정렬 기준으로 부적합.
 *  히어로 스킨 활성화(evo bit 1)는 sortedIndices에서 별도 처리. */
function isHero(id: number): boolean {
  const meta = metaStore.get(id)
  return meta?.rarity?.toUpperCase() === 'CHAMPION'
}

function cardName(id: number): string {
  return metaStore.get(id)?.name ?? String(id)
}

function cardImg(id: number, evoLevel = 0): string {
  const meta = metaStore.get(id)
  if (meta) return cardImage(meta.name, evoLevel, 0, meta.cardType)
  return '/cards/unknown.png'
}

function cardLabel(id: number, deck: DeckStatsResponse, i: number): string {
  const name = cardName(id)
  const evoLevel = deck.cardEvoLevels?.[i] ?? 0
  if (evoLevel > 0) return `진화 ${name}`
  if (isHero(id)) return `히어로 ${name}`
  return name
}

/**
 * 카드 정렬 규칙:
 *   1번: 진화 (진화 없으면 일반)
 *   2번: 히어로/챔피언 (없으면 일반)
 *   3번: 히어로/챔피언 or 진화 (없으면 일반)
 *   4~: 나머지 일반 → 타워
 *
 * 진화는 1, 3번만. 히어로/챔피언은 2, 3번만. 2번에 진화 오지 않음.
 */
function sortedIndices(deck: DeckStatsResponse): number[] {
  const evo: number[] = []
  const hero: number[] = []
  const normal: number[] = []
  const tower: number[] = []
  for (let i = 0; i < deck.cardIds.length; i++) {
    const id = deck.cardIds[i]
    const el = deck.cardEvoLevels?.[i] ?? 0
    const hasEvo = (el & 1) > 0      // bit 0: 진화
    if (id >= 159000000) tower.push(i)
    else if (hasEvo) evo.push(i)
    else if (isHero(id) || (el & 2) > 0) hero.push(i)  // cardType HERO/CHAMPION 또는 히어로 스킨(bit 1)
    else normal.push(i)
  }
  const result: number[] = []
  // 1번: 진화
  result.push(evo.length > 0 ? evo.shift()! : normal.shift() ?? tower.shift()!)
  // 2번: 히어로/챔피언
  result.push(hero.length > 0 ? hero.shift()! : normal.shift() ?? tower.shift()!)
  // 3번: 히어로/챔피언 우선, 없으면 진화
  if (hero.length > 0) result.push(hero.shift()!)
  else if (evo.length > 0) result.push(evo.shift()!)
  else result.push(normal.shift() ?? tower.shift()!)
  // 4~: 남은 진화 → 히어로 → 일반 → 타워
  result.push(...evo, ...hero, ...normal, ...tower)
  const filtered = result.filter(i => i !== undefined)
  console.log('sortedIndices', deck.cardIds, filtered)
  return filtered
}
</script>

<style scoped>
.deck-row { transition: background 0.12s; }
.deck-row:hover { background: rgba(45, 107, 228, 0.06); }
.deck-row.expandable { cursor: pointer; }
.deck-row.expanded { background: rgba(45, 107, 228, 0.04); }

.variant-row {
  background: rgba(15, 22, 35, 0.6);
}
.variant-row:hover { background: rgba(45, 107, 228, 0.04); }

.rank-cell {
  width: 40px;
  text-align: center;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-dim);
}

.tier-cell {
  width: 44px;
  text-align: center;
  padding: 0 4px;
}

.tier-badge {
  display: inline-block;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.8rem;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.05em;
}

.tier-S { background: rgba(255, 59, 59, 0.18); color: #ff4d4d; border: 1px solid rgba(255, 59, 59, 0.4); }
.tier-A { background: rgba(255, 165, 0, 0.18); color: #ffaa00; border: 1px solid rgba(255, 165, 0, 0.4); }
.tier-B { background: rgba(245, 196, 24, 0.15); color: #e8c414; border: 1px solid rgba(245, 196, 24, 0.35); }
.tier-C { background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.35); }
.tier-D { background: rgba(127, 140, 141, 0.15); color: var(--text-dim); border: 1px solid rgba(127, 140, 141, 0.3); }

.cards-cell { padding: 8px 12px; }

.cards-cell-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.variant-indent {
  padding-left: 12px;
  border-left: 2px solid rgba(45, 107, 228, 0.3);
}

.card-strip {
  display: flex;
  gap: 3px;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.card-strip-sm { gap: 2px; }

/* ── 카드 썸네일 ── */
.card-thumb {
  position: relative;
  width: 40px;
  height: 47px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  flex-shrink: 0;
  transition: border-color 0.15s;
}

.card-thumb-sm {
  width: 34px;
  height: 40px;
}

.card-thumb.is-evo {
  border-color: rgba(245, 196, 24, 0.7);
  box-shadow: 0 0 6px rgba(245, 196, 24, 0.3);
}

.card-thumb.is-hero {
  border-color: rgba(231, 76, 60, 0.6);
  box-shadow: 0 0 6px rgba(231, 76, 60, 0.25);
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── 진화/히어로 카드 일러스트 강조 스트립 ── */
.feature-strip {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
  padding-left: 4px;
  border-left: 1px solid var(--border);
}

.feature-strip-sm {
  padding-left: 3px;
  gap: 3px;
}

.feature-thumb {
  position: relative;
  width: 46px;
  height: 54px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface);
  flex-shrink: 0;
  transition: box-shadow 0.15s;
}

.feature-thumb-sm {
  width: 38px;
  height: 44px;
}

.feature-thumb.is-evo {
  border: 2px solid rgba(245, 196, 24, 0.85);
  box-shadow: 0 0 10px rgba(245, 196, 24, 0.45), 0 0 4px rgba(245, 196, 24, 0.2);
}

.feature-thumb.is-hero {
  border: 2px solid rgba(231, 76, 60, 0.85);
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.4), 0 0 4px rgba(231, 76, 60, 0.2);
}

.feature-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── 변형 토글 ── */
.variant-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.variant-count-badge {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: rgba(45, 107, 228, 0.15);
  color: #7ab3ff;
  border: 1px solid rgba(45, 107, 228, 0.3);
  white-space: nowrap;
}

.expand-caret {
  font-size: 0.6rem;
  color: var(--text-muted);
}

/* ── Stats ── */
.stat-cell {
  text-align: right;
  padding: 8px 16px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.95rem;
  white-space: nowrap;
}

.win-rate { color: var(--win); font-weight: 700; }

.score-badge {
  background: rgba(245, 196, 24, 0.12);
  color: var(--gold);
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.dim { color: var(--text-dim); }

/* ── Mobile ── */
@media (max-width: 640px) {
  .card-strip {
    display: grid;
    grid-template-columns: repeat(4, auto) 1fr;
    grid-template-rows: auto auto;
    gap: 2px;
    width: fit-content;
  }
  .card-strip-sm {
    display: grid;
    grid-template-columns: repeat(4, auto) 1fr;
    grid-template-rows: auto auto;
    gap: 2px;
    width: fit-content;
  }
  .card-thumb { width: 28px; height: 33px; }
  .card-thumb-sm { width: 24px; height: 28px; }
  /* 9번째(타워) → 5열, 1~2행 세로 중앙 */
  .card-thumb:nth-child(9) {
    grid-column: 5;
    grid-row: 1 / 3;
    align-self: center;
  }
  .feature-strip { display: none; }
  .feature-strip-sm { display: none; }
  .stat-cell { padding: 4px 6px; font-size: 0.8rem; }
  .cards-cell { padding: 5px 4px; }
  .cards-cell-inner { flex-wrap: wrap; gap: 4px; }
  .rank-cell { width: 28px; font-size: 0.85rem; }
  .tier-cell { width: 32px; }
  .tier-badge { font-size: 0.7rem; padding: 1px 5px; }
  .variant-count-badge { font-size: 0.6rem; padding: 1px 3px; }
  .variant-toggle { width: 100%; justify-content: flex-start; }
  .variant-indent { padding-left: 6px; }
  .score-badge { padding: 1px 5px; }
}
</style>

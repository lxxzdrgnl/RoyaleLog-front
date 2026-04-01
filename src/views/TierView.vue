<template>
  <div>
    <AppNav />
    <div class="tier-page">

    <!-- CONTROLS ROW 1 -->
    <div class="controls">
      <div class="control-group">
        <label class="ctrl-label">배틀 타입</label>
        <div class="seg-buttons">
          <button
            v-for="bt in BATTLE_TYPES" :key="bt.value"
            class="seg-btn" :class="{ active: battleType === bt.value }"
            @click="battleType = bt.value"
          >{{ bt.label }}</button>
        </div>
      </div>

      <div class="control-group">
        <label class="ctrl-label">기간</label>
        <div class="seg-buttons">
          <button
            v-for="d in DAYS_OPTIONS" :key="d"
            class="seg-btn" :class="{ active: days === d }"
            @click="days = d"
          >{{ d }}일</button>
        </div>
      </div>

      <div class="control-group">
        <label class="ctrl-label">보기</label>
        <div class="seg-buttons">
          <button class="seg-btn" :class="{ active: tab === 'deck' }" @click="tab = 'deck'">덱 순위</button>
          <button class="seg-btn" :class="{ active: tab === 'card' }" @click="tab = 'card'">카드 순위</button>
        </div>
      </div>
    </div>

    <!-- CONTROLS ROW 2: 필터 (배틀타입별) -->
    <div class="controls controls-row2">
      <!-- PoL 리그 필터 — 높은 리그 왼쪽 -->
      <div v-if="battleType === 'pathOfLegend'" class="control-group">
        <label class="ctrl-label">리그</label>
        <div class="seg-buttons">
          <button
            v-for="lg in [...LEAGUE_OPTIONS].reverse()" :key="lg.value"
            class="seg-btn" :class="{ active: leagueNumber === lg.value }"
            @click="leagueNumber = lg.value"
          >{{ lg.label }}</button>
        </div>
      </div>

      <!-- PvP 아레나 드롭다운 -->
      <div v-else class="control-group">
        <label class="ctrl-label">아레나</label>
        <select class="arena-select" v-model="selectedArena">
          <option v-for="a in ARENA_OPTIONS" :key="a.id" :value="a">{{ a.label }}</option>
        </select>
      </div>
    </div>

    <!-- ERROR -->
    <div v-if="error" class="state-center">
      <p class="err-msg">{{ error }}</p>
      <button class="retry-btn" @click="load">다시 시도</button>
    </div>

    <!-- LOADING -->
    <div v-else-if="loading" class="state-center">
      <div class="spinner" />
      <p>불러오는 중...</p>
    </div>

    <!-- DECK TABLE -->
    <div v-else-if="tab === 'deck'" class="table-wrap">
      <table class="rank-table">
        <thead>
          <tr>
            <th class="th-rank">#</th>
            <th class="th-tier sortable" @click="toggleSort('tier')">티어 <span class="sort-arrow">{{ sortIcon('tier') }}</span></th>
            <th class="th-cards">카드 구성</th>
            <th class="th-stat sortable" @click="toggleSort('winRate')">승률 <span class="sort-arrow">{{ sortIcon('winRate') }}</span></th>
            <th class="th-stat sortable" @click="toggleSort('score')">점수 <span class="sort-arrow">{{ sortIcon('score') }}</span></th>
            <th class="th-stat sortable" @click="toggleSort('useCount')">사용수 <span class="sort-arrow">{{ sortIcon('useCount') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <DeckRow
            v-for="(group, i) in sortedDeckList"
            :key="group.baseDeckHash"
            :group="group"
            :rank="i + 1"
          />
        </tbody>
      </table>
    </div>

    <!-- CARD TABLE -->
    <div v-else class="table-wrap">
      <table class="rank-table">
        <thead>
          <tr>
            <th class="th-rank">#</th>
            <th class="th-tier sortable" @click="toggleCardSort('tier')">티어 <span class="sort-arrow">{{ cardSortIcon('tier') }}</span></th>
            <th></th>
            <th class="th-name">카드</th>
            <th class="th-stat sortable" @click="toggleCardSort('winRate')">승률 <span class="sort-arrow">{{ cardSortIcon('winRate') }}</span></th>
            <th class="th-stat sortable" @click="toggleCardSort('score')">점수 <span class="sort-arrow">{{ cardSortIcon('score') }}</span></th>
            <th class="th-stat sortable" @click="toggleCardSort('useCount')">사용수 <span class="sort-arrow">{{ cardSortIcon('useCount') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <CardRankRow
            v-for="(card, i) in sortedCardList"
            :key="card.cardId"
            :card="card"
            :rank="i + 1"
            :tier="scoreTierMap.get(card.cardId)"
          />
        </tbody>
      </table>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { fetchTierList, fetchCardRanking, type TierFilter, type DeckStatsResponse, type CardRankingResponse, type DeckGroup } from '@/api/tier'
import { useCardMetaStore } from '@/stores/cardMeta'
import AppNav from '@/components/AppNav.vue'
import DeckRow from '@/components/DeckRow.vue'
import CardRankRow from '@/components/CardRankRow.vue'

// ── 상수 ──────────────────────────────────────────────────────────
const BATTLE_TYPES = [
  { value: 'pathOfLegend', label: 'PoL' },
  { value: 'PvP',          label: '트로피' },
]

const DAYS_OPTIONS = [1, 3, 7]

const LEAGUE_OPTIONS = [
  { value: 1, label: '마스터1' },
  { value: 2, label: '마스터2' },
  { value: 3, label: '마스터3' },
  { value: 4, label: '챔피언' },
  { value: 5, label: '그챔' },
  { value: 6, label: '로챔' },
  { value: 7, label: '얼챔' },
]

interface ArenaOption {
  id: number
  label: string
  min: number
  max: number
}

const ARENA_OPTIONS: ArenaOption[] = [
  { id: 29, label: '히어로 신전 (11500~11999)',        min: 11500, max: 11999 },
  { id: 28, label: '머스킷병 거리 (11000~11499)',       min: 11000, max: 11499 },
  { id: 27, label: '로얄 로드 (10500~10999)',           min: 10500, max: 10999 },
  { id: 26, label: '사랑이 넘치는 오두막 (10000~10499)', min: 10000, max: 10499 },
  { id: 25, label: '전설 아레나 (9500~9999)',           min: 9500,  max: 9999  },
  { id: 24, label: '발칼라 (9000~9499)',                min: 9000,  max: 9499  },
  { id: 23, label: '팬케이크! (8500~8999)',             min: 8500,  max: 8999  },
  { id: 22, label: '클래시 축제 (8000~8499)',           min: 8000,  max: 8499  },
  { id: 21, label: '부트 캠프 (7500~7999)',             min: 7500,  max: 7999  },
  { id: 20, label: '드래곤 스파 (7000~7499)',           min: 7000,  max: 7499  },
  { id: 19, label: '고요의 성역 (6500~6999)',           min: 6500,  max: 6999  },
  { id: 18, label: '왕가의 무덤 (6000~6499)',           min: 6000,  max: 6499  },
  { id: 17, label: '도끼맨의 키친 (5500~5999)',         min: 5500,  max: 5999  },
  { id: 16, label: '광부의 광산 (5000~5499)',           min: 5000,  max: 5499  },
  { id: 15, label: '평온의 봉우리 (4600~4999)',         min: 4600,  max: 4999  },
  { id: 14, label: '악동의 은신처 (4200~4599)',         min: 4200,  max: 4599  },
  { id: 13, label: '으스스 마을 (3800~4199)',           min: 3800,  max: 4199  },
  { id: 12, label: '일렉트로 아레나 (3400~3799)',       min: 3400,  max: 3799  },
  { id: 11, label: '호그 마운틴 (3000~3399)',           min: 3000,  max: 3399  },
  { id: 10, label: '정글 아레나 (2600~2999)',           min: 2600,  max: 2999  },
  { id: 9,  label: '얼음 골짜기 (2300~2599)',           min: 2300,  max: 2599  },
  { id: 8,  label: '로얄 아레나 (2000~2299)',           min: 2000,  max: 2299  },
  { id: 7,  label: 'P.E.K.K.A의 놀이터 (1600~1999)',   min: 1600,  max: 1999  },
  { id: 6,  label: '장인의 작업실 (1300~1599)',         min: 1300,  max: 1599  },
  { id: 5,  label: '마법 계곡 (1000~1299)',             min: 1000,  max: 1299  },
  { id: 4,  label: '바바리안 경기장 (600~999)',          min: 600,   max: 999   },
  { id: 3,  label: '해골 구덩이 (300~599)',              min: 300,   max: 599   },
  { id: 2,  label: '고블린 스타디움 (0~299)',            min: 0,     max: 299   },
]

const DEFAULT_LEAGUE = 7
const DEFAULT_ARENA  = ARENA_OPTIONS[0]  // 가장 높은 아레나

const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 }

function assignTier(index: number, total: number): string {
  if (total === 0) return 'D'
  const pct = index / total
  if (pct < 0.05) return 'S'
  if (pct < 0.15) return 'A'
  if (pct < 0.35) return 'B'
  if (pct < 0.65) return 'C'
  return 'D'
}

// ── 상태 ──────────────────────────────────────────────────────────
const metaStore    = useCardMetaStore()
const tab          = ref<'deck' | 'card'>('deck')
const battleType   = ref('pathOfLegend')
const days         = ref(7)
const leagueNumber = ref<number>(DEFAULT_LEAGUE)
const selectedArena = ref<ArenaOption>(DEFAULT_ARENA)
const loading      = ref(false)
const error        = ref('')
const tierList     = ref<DeckStatsResponse[]>([])
const cardRanking  = ref<CardRankingResponse[]>([])

// ── 정렬 ──────────────────────────────────────────────────────────
type SortKey = 'tier' | 'score' | 'winRate' | 'useCount'

const deckSortKey = ref<SortKey>('score')
const deckSortDir = ref<'asc' | 'desc'>('desc')
const cardSortKey = ref<SortKey>('score')
const cardSortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(key: SortKey) {
  if (deckSortKey.value === key) deckSortDir.value = deckSortDir.value === 'desc' ? 'asc' : 'desc'
  else { deckSortKey.value = key; deckSortDir.value = 'desc' }
}
function sortIcon(key: SortKey) {
  return deckSortKey.value !== key ? '↕' : deckSortDir.value === 'desc' ? '↓' : '↑'
}

function toggleCardSort(key: SortKey) {
  if (cardSortKey.value === key) cardSortDir.value = cardSortDir.value === 'desc' ? 'asc' : 'desc'
  else { cardSortKey.value = key; cardSortDir.value = 'desc' }
}
function cardSortIcon(key: SortKey) {
  return cardSortKey.value !== key ? '↕' : cardSortDir.value === 'desc' ? '↓' : '↑'
}

// 배틀 타입 전환 시 필터 초기화
watch(battleType, (bt) => {
  if (bt === 'pathOfLegend') leagueNumber.value = DEFAULT_LEAGUE
  else selectedArena.value = DEFAULT_ARENA
})

// ── 데이터 로드 ────────────────────────────────────────────────────
function buildFilter(): TierFilter {
  if (battleType.value === 'pathOfLegend') {
    return { leagueNumber: leagueNumber.value }
  } else {
    return { minTrophies: selectedArena.value.min, maxTrophies: selectedArena.value.max }
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    await metaStore.init()
    const filter = buildFilter()
    if (tab.value === 'deck') {
      tierList.value = await fetchTierList(battleType.value, days.value, filter)
    } else {
      cardRanking.value = await fetchCardRanking(battleType.value, days.value, filter)
    }
  } catch (e: any) {
    error.value = e.message ?? '데이터를 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

// ── 덱 그룹핑 + 티어 배정 ─────────────────────────────────────────
const groupedTierList = computed<DeckGroup[]>(() => {
  const groups = new Map<string, DeckStatsResponse[]>()
  for (const deck of tierList.value) {
    const key = deck.baseDeckHash
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(deck)
  }
  const result: Omit<DeckGroup, 'tier'>[] = []
  for (const [baseDeckHash, variants] of groups) {
    variants.sort((a, b) => b.useCount - a.useCount)
    const totalUseCount = variants.reduce((s, v) => s + v.useCount, 0)
    const topScore = Math.max(...variants.map(v => Number(v.score)))
    result.push({ baseDeckHash, representative: variants[0], variants, totalUseCount, topScore })
  }
  result.sort((a, b) => b.topScore - a.topScore)
  const top50 = result.slice(0, 50)
  return top50.map((g, i) => ({ ...g, tier: assignTier(i, top50.length) }))
})

// ── 덱 정렬 ───────────────────────────────────────────────────────
const sortedDeckList = computed<DeckGroup[]>(() => {
  const list = [...groupedTierList.value]
  const asc  = deckSortDir.value === 'asc'
  return list.sort((a, b) => {
    let diff: number
    switch (deckSortKey.value) {
      case 'score':    diff = Number(a.topScore) - Number(b.topScore); break
      case 'winRate':  diff = Number(a.representative.winRate) - Number(b.representative.winRate); break
      case 'useCount': diff = a.totalUseCount - b.totalUseCount; break
      case 'tier':     diff = TIER_ORDER[b.tier] - TIER_ORDER[a.tier]; break
      default: diff = 0
    }
    return asc ? diff : -diff
  })
})

// ── 카드 정렬 + 티어 매핑 ─────────────────────────────────────────
const baseCardList = computed(() => cardRanking.value.slice(0, 100))

// score 순서 기준 티어 배정 → 정렬 변경해도 뱃지 불변
const scoreTierMap = computed(() => {
  const sorted = [...baseCardList.value].sort((a, b) => Number(b.score) - Number(a.score))
  const map = new Map<number, string>()
  sorted.forEach((c, i) => map.set(c.cardId, assignTier(i, sorted.length)))
  return map
})

const sortedCardList = computed<CardRankingResponse[]>(() => {
  const list = [...baseCardList.value]
  const asc  = cardSortDir.value === 'asc'
  return list.sort((a, b) => {
    let diff: number
    switch (cardSortKey.value) {
      case 'score':    diff = Number(a.score)    - Number(b.score);    break
      case 'winRate':  diff = Number(a.winRate)  - Number(b.winRate);  break
      case 'useCount': diff = a.useCount - b.useCount;                 break
      case 'tier': {
        const ta = TIER_ORDER[scoreTierMap.value.get(a.cardId) ?? 'D']
        const tb = TIER_ORDER[scoreTierMap.value.get(b.cardId) ?? 'D']
        diff = tb - ta  // S(0) 먼저
        break
      }
      default: diff = 0
    }
    return asc ? diff : -diff
  })
})

watch([tab, battleType, days, leagueNumber, selectedArena], load)
onMounted(load)
</script>

<style scoped>
.tier-page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

/* CONTROLS */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 12px;
}

.controls-row2 {
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ctrl-label {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.seg-buttons { display: flex; gap: 4px; flex-wrap: wrap; }

.seg-btn {
  padding: 5px 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-dim);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: var(--fs-base);
  cursor: pointer;
  transition: all 0.15s;
}

.seg-btn:hover { border-color: var(--blue-dim); color: var(--text); }
.seg-btn.active { background: var(--blue); border-color: var(--blue); color: #fff; font-weight: 700; }

/* 아레나 드롭다운 */
.arena-select {
  padding: 5px 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: var(--fs-base);
  cursor: pointer;
  min-width: 260px;
}

.arena-select:focus { outline: none; border-color: var(--blue); }

/* TABLE */
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
}

.rank-table thead tr {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.rank-table th {
  padding: 10px 16px;
  font-family: var(--font-display);
  font-size: var(--fs-sm);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.rank-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.rank-table th.sortable:hover { color: var(--text); }

.sort-arrow {
  font-size: 0.7rem;
  opacity: 0.6;
  margin-left: 3px;
}

.th-rank  { width: 40px; text-align: center; }
.th-tier  { width: 44px; text-align: center; }
.th-stat  { text-align: right; }
.th-name  { text-align: left; }
.th-cards { text-align: left; }

.rank-table tbody tr { border-bottom: 1px solid var(--border); }
.rank-table tbody tr:last-child { border-bottom: none; }

/* STATES */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--text-dim);
  font-size: var(--fs-base);
}

.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.err-msg { color: var(--loss); }

.retry-btn {
  padding: 6px 20px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: var(--fs-base);
  cursor: pointer;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .tier-page { padding: 12px 12px 32px; }
  .controls { gap: 8px; margin-bottom: 8px; }
  .controls-row2 { margin-bottom: 10px; }
  .seg-btn { padding: 4px 8px; font-size: var(--fs-sm); }
  .arena-select { min-width: 160px; font-size: var(--fs-sm); }
  .table-wrap { border-radius: var(--radius-sm); overflow-x: hidden; }
  .rank-table { table-layout: fixed; width: 100%; }
  .rank-table th { padding: 6px 4px; font-size: 0.65rem; }
  .rank-table td { padding: 4px 2px; }
  .th-rank { width: 24px; }
  .th-tier { width: 30px; }
  .th-stat { width: 48px; padding: 6px 2px; }
}
</style>

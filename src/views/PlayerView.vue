<template>
  <div class="player-page">
    <!-- NAV -->
    <nav class="top-nav">
      <RouterLink to="/" class="nav-logo">
        <span>RoyaleLog</span>
      </RouterLink>
      <form class="nav-search-wrap" @submit.prevent="goSearch">
        <div class="nav-search" :class="{ focused: navFocused }">
          <span class="nav-hash">#</span>
          <input v-model="searchTag" placeholder="태그 검색..." class="nav-input"
            autocomplete="off"
            @focus="navFocused = true" @blur="onNavBlur" />
        </div>
        <div v-if="navFocused && navFilteredTags.length" class="nav-dropdown">
          <div v-for="t in navFilteredTags" :key="t.tag" class="nav-dd-item"
            @mousedown.prevent="navPickTag(t.tag)">
            <div class="nav-dd-info">
              <span v-if="t.name" class="nav-dd-name">{{ t.name }}</span>
              <span class="nav-dd-tag">#{{ t.tag }}</span>
            </div>
            <button type="button" class="nav-dd-remove" @mousedown.stop.prevent="remove(t.tag)">✕</button>
          </div>
        </div>
      </form>
    </nav>

    <div v-if="store.loading" class="state-center">
      <div class="spinner" /><p>데이터 불러오는 중...</p>
    </div>
    <div v-else-if="store.error" class="state-center">
      <p class="err-text">{{ store.error }}</p>
      <RouterLink to="/" class="btn-back">← 돌아가기</RouterLink>
    </div>

    <div v-else-if="store.profile" class="main">
      <!-- ── PROFILE HEADER ── -->
      <header class="profile-header">
        <div class="header-inner">
          <div class="arena-wrap">
            <img :src="arenaImage(store.profile.arena?.id ?? 12)" class="arena-img" alt="arena"
              @error="(e:any)=>e.target.src='/arenas/arena12.png'" />
          </div>
          <div class="player-info">
            <div class="player-name-row">
              <h2 class="player-name">{{ store.profile.name }}</h2>
              <span v-if="store.profile.clan" class="clan-tag">
                {{ store.profile.clan.name }}
                <span v-if="store.profile.clan.role" class="clan-role">{{ clanRoleLabel(store.profile.clan.role) }}</span>
              </span>
            </div>
            <div class="player-stats">
              <StatBadge icon="🏆" :value="store.profile.trophies.toLocaleString()" label="트로피" gold />
              <StatBadge icon="📈" :value="store.profile.bestTrophies.toLocaleString()" label="최고" />
              <StatBadge icon="⚔️" :value="store.profile.wins.toLocaleString()" label="승리" />
              <StatBadge icon="💀" :value="store.profile.losses.toLocaleString()" label="패배" />
              <StatBadge icon="👑" :value="winRate" label="승률" />
              <StatBadge icon="⭐" :value="`Lv.${store.profile.expLevel}`" label="레벨" />
            </div>
          </div>
        </div>
      </header>

      <!-- ── TABS ── -->
      <div class="tabs-wrap">
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.id" class="tab-btn"
            :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ── TAB CONTENT ── -->
      <div class="tab-content">

        <!-- ────────────────── 홈 ────────────────── -->
        <div v-if="activeTab === 'home'">
          <!-- 현재 덱 -->
          <div v-if="store.profile.currentDeck?.length" class="section">
            <h3 class="section-title">현재 덱</h3>
            <div class="current-deck">
              <div v-for="c in store.profile.currentDeck" :key="c.id" class="deck-card">
                <img
                  :src="cardImage(c.name, c.evolutionLevel ?? 0, c.starLevel ?? 0)"
                  :alt="c.name"
                  @error="(e:any) => e.target.src = c.iconUrls?.medium ?? ''"
                />
                <span class="deck-card-lv">{{ displayLevel(c.level, c.rarity ?? 'common') }}</span>
                <span v-if="(c.evolutionLevel ?? 0) > 0" class="deck-card-evo">⚡</span>
              </div>
            </div>
          </div>

          <!-- 통계 2-column -->
          <div class="stats-layout">
            <div class="stats-col">
              <div class="stat-block">
                <h3 class="stat-block-title">Ranked Stats</h3>
                <template v-if="store.profile.leagueStatistics">
                  <div v-if="store.profile.leagueStatistics.bestSeason" class="ranked-section">
                    <p class="ranked-label">최고 시즌</p>
                    <div class="ranked-row"><span>등수</span><span>{{ store.profile.leagueStatistics.bestSeason.rank ? '#'+store.profile.leagueStatistics.bestSeason.rank : 'Unranked' }}</span></div>
                    <div class="ranked-row"><span>트로피</span><span class="gold">{{ store.profile.leagueStatistics.bestSeason.trophies.toLocaleString() }} 🏆</span></div>
                  </div>
                  <div v-if="store.profile.leagueStatistics.currentSeason" class="ranked-section">
                    <p class="ranked-label">현재 시즌</p>
                    <div class="ranked-row"><span>등수</span><span>{{ store.profile.leagueStatistics.currentSeason.rank ? '#'+store.profile.leagueStatistics.currentSeason.rank : 'Unranked' }}</span></div>
                    <div class="ranked-row"><span>트로피</span><span>{{ store.profile.leagueStatistics.currentSeason.trophies.toLocaleString() }}</span></div>
                    <div v-if="store.profile.leagueStatistics.currentSeason.bestTrophies" class="ranked-row"><span>PB</span><span class="gold">{{ store.profile.leagueStatistics.currentSeason.bestTrophies!.toLocaleString() }} 🏆</span></div>
                  </div>
                  <div v-if="store.profile.leagueStatistics.previousSeason" class="ranked-section">
                    <p class="ranked-label">지난 시즌</p>
                    <div class="ranked-row"><span>등수</span><span>{{ store.profile.leagueStatistics.previousSeason.rank ? '#'+store.profile.leagueStatistics.previousSeason.rank : 'Unranked' }}</span></div>
                    <div class="ranked-row"><span>트로피</span><span>{{ store.profile.leagueStatistics.previousSeason.trophies.toLocaleString() }}</span></div>
                  </div>
                </template>
                <div v-if="store.profile.legacyTrophyRoadHighScore" class="ranked-section">
                  <p class="ranked-label">Best Legacy Ladder</p>
                  <div class="ranked-row"><span>트로피</span><span class="gold">{{ store.profile.legacyTrophyRoadHighScore!.toLocaleString() }} 🏆</span></div>
                </div>
              </div>
              <div class="stat-block">
                <h3 class="stat-block-title">도전 통계</h3>
                <div class="kv-list">
                  <div class="kv-row"><span>최대 승리 수</span><span>{{ store.profile.challengeMaxWins ?? '-' }}</span></div>
                  <div class="kv-row"><span>획득한 카드</span><span>{{ store.profile.challengeCardsWon?.toLocaleString() ?? '-' }}</span></div>
                </div>
                <p class="kv-sub">토너먼트</p>
                <div class="kv-list">
                  <div class="kv-row"><span>모든 전투</span><span>{{ store.profile.tournamentBattleCount?.toLocaleString() ?? '-' }}</span></div>
                  <div class="kv-row"><span>획득한 카드</span><span>{{ store.profile.tournamentCardsWon?.toLocaleString() ?? '-' }}</span></div>
                  <div v-if="store.profile.tournamentBattleCount && store.profile.tournamentCardsWon" class="kv-row">
                    <span>경기당 카드 수</span><span>{{ (store.profile.tournamentCardsWon!/store.profile.tournamentBattleCount!).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="stats-col">
              <div class="stat-block">
                <h3 class="stat-block-title">전투 통계</h3>
                <p class="kv-sub">클랜전</p>
                <div class="kv-list">
                  <div class="kv-row"><span>수집한 카드</span><span>{{ store.profile.clanCardsCollected?.toLocaleString() ?? '-' }}</span></div>
                  <div class="kv-row"><span>전쟁일 승리</span><span>{{ store.profile.warDayWins ?? '-' }}</span></div>
                </div>
                <div class="battle-table">
                  <div class="bt-head"><span></span><span>집계된 수</span><span>%</span></div>
                  <div class="bt-row win-row"><span>승리</span><span>{{ store.profile.wins.toLocaleString() }}</span><span>{{ winPct }}%</span></div>
                  <div class="bt-row loss-row"><span>패배</span><span>{{ store.profile.losses.toLocaleString() }}</span><span>{{ lossPct }}%</span></div>
                  <div class="bt-row"><span>모든 전투</span><span>{{ store.profile.battleCount.toLocaleString() }}</span><span></span></div>
                  <div class="bt-row"><span>3 크라운 승리</span><span>{{ store.profile.threeCrownWins.toLocaleString() }}</span><span></span></div>
                </div>
              </div>
              <div class="stat-block">
                <h3 class="stat-block-title">기타 통계</h3>
                <div class="kv-list">
                  <div class="kv-row"><span>킹 레벨</span><span>레벨 {{ store.profile.expLevel }}</span></div>
                  <div class="kv-row"><span>찾은 카드</span><span>{{ store.profile.cards.length }} / {{ store.profile.cards.length }}</span></div>
                  <div v-if="store.profile.totalDonations" class="kv-row"><span>지원 합계</span><span>{{ store.profile.totalDonations!.toLocaleString() }}</span></div>
                  <div v-if="store.profile.starPoints" class="kv-row"><span>Star Points</span><span>{{ store.profile.starPoints!.toLocaleString() }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tower / Hero / Evo -->
          <div v-if="towerCards.length" class="section">
            <h3 class="section-title">Tower Card Collection</h3>
            <div class="coll-row">
              <div v-for="c in towerCards" :key="c.id" class="coll-chip" :class="rarityClass(c.rarity)">
                <img :src="cardImage(c.name, 0, c.starLevel ?? 0)" :alt="c.name" @error="(e:any)=>e.target.src=c.iconUrls?.medium??''"/>
                <span class="coll-lv">{{ displayLevel(c.level, c.rarity) }}</span>
              </div>
            </div>
          </div>
          <div v-if="heroCards.length" class="section">
            <h3 class="section-title">Champion Collection</h3>
            <div class="coll-row">
              <div v-for="c in heroCards" :key="c.id" class="coll-chip" :class="rarityClass(c.rarity)">
                <img :src="c.iconUrls?.medium ?? ''" :alt="c.name" @error="(e:any)=>e.target.src=chrImage(c.name)"/>
                <span class="coll-lv">{{ displayLevel(c.level, c.rarity) }}</span>
              </div>
            </div>
          </div>
          <div v-if="evoCards.length" class="section">
            <h3 class="section-title">Evo Card Collection</h3>
            <div class="coll-row">
              <div v-for="c in evoCards" :key="c.id" class="coll-chip" :class="rarityClass(c.rarity)">
                <img :src="cardImage(c.name, 1)" :alt="c.name" @error="(e:any)=>e.target.src=c.iconUrls?.medium??''"/>
                <span class="coll-lv">{{ displayLevel(c.level, c.rarity) }}</span>
              </div>
            </div>
          </div>

          <!-- 컬렉션 레벨 -->
          <div class="section">
            <h3 class="section-title">컬렉션 레벨</h3>
            <div class="level-bar">
              <div v-for="(g,i) in levelGroups" :key="g.level" class="level-bar-seg"
                :style="{ width: pct(g.cards.length, regularCards.length)+'%', background: levelColor(g.level,i) }" />
            </div>
            <div class="level-badges">
              <div v-for="(g,i) in levelGroups" :key="g.level" class="level-badge"
                :style="{ background: levelColor(g.level,i) }">
                <span class="lbadge-lv">{{ g.level }}</span>
                <span class="lbadge-pct">{{ pct(g.cards.length, regularCards.length) }}%</span>
              </div>
            </div>
            <div v-for="g in levelGroups" :key="g.level" class="level-group">
              <div class="level-group-header">
                <span class="lg-title">Level {{ g.level }}</span>
                <span v-if="g.level === maxCardLevel" class="lg-max">Max</span>
              </div>
              <div class="lg-stats">
                <span class="lg-stat">Total <b>{{ g.cards.length }}</b> ({{ pct(g.cards.length, regularCards.length) }}%)</span>
                <span class="lg-stat">Count <b>{{ g.cards.filter(c=>c.level<=c.maxLevel).length }}</b> ({{ pct(g.cards.filter(c=>c.level<=c.maxLevel).length, regularCards.length) }}%)</span>
                <span class="lg-stat">Overleveled <b>{{ g.cards.filter(c=>c.level>c.maxLevel).length }}</b> ({{ pct(g.cards.filter(c=>c.level>c.maxLevel).length, regularCards.length) }}%)</span>
              </div>
              <div class="coll-row">
                <div v-for="c in g.cards" :key="c.id" class="coll-chip" :class="[rarityClass(c.rarity), c.level>c.maxLevel?'coll-over':'']">
                  <img :src="cardImage(c.name, c.evolutionLevel??0, c.starLevel??0)" :alt="c.name" @error="(e:any)=>e.target.src=c.iconUrls?.medium??''"/>
                  <span class="coll-lv">{{ displayLevel(c.level, c.rarity) }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ────────────────── 전투 기록 ────────────────── -->
        <div v-if="activeTab === 'battles'">
          <div v-if="store.battles.length === 0 && !store.loading" class="empty">전투 기록이 없습니다.</div>
          <div v-else class="battle-list">
            <BattleCard v-for="battle in store.battles" :key="battle.battleTime"
              :battle="battle" :my-tag="store.profile!.tag" :rarity-map="cardRarityMap" />
            <div ref="scrollSentinel" class="sentinel">
              <div v-if="store.loadingMore" class="spinner-sm" />
              <span v-else-if="!store.hasMore" class="no-more">모든 전투 기록을 불러왔습니다</span>
            </div>
          </div>
        </div>

        <!-- ────────────────── 사용한 덱 정리 ────────────────── -->
        <div v-if="activeTab === 'decks'">
          <div class="deck-list">
            <div v-for="(deck, i) in deckStats" :key="i" class="deck-row">
              <div class="deck-cards">
                <CardChip v-for="card in deck.cards" :key="card.id" :card="card" size="md" />
              </div>
              <div class="deck-meta">
                <span class="deck-played">{{ deck.played }}전</span>
                <WinRateBar :rate="deck.played > 0 ? deck.won / deck.played : 0" />
              </div>
            </div>
          </div>
        </div>

        <!-- ────────────────── 카드 컬렉션 ────────────────── -->
        <div v-if="activeTab === 'cards'">
          <h3 class="section-title" style="margin-bottom:16px">Card Collection</h3>
          <!-- 서브탭 -->
          <div class="subtabs">
            <button v-for="st in cardSubTabs" :key="st.id" class="subtab-btn"
              :class="{ active: cardSubTab === st.id }" @click="cardSubTab = st.id">
              {{ st.label }}
            </button>
          </div>

          <!-- 레벨 -->
          <div v-if="cardSubTab === 'level'">
            <div class="cc-sort-row">
              <span class="cc-sort-label">Sort:</span>
              <select v-model="levelSort" class="cc-select">
                <option value="level-desc">Level ▼</option>
                <option value="level-asc">Level ▲</option>
                <option value="name">이름</option>
              </select>
            </div>
            <div class="cc-grid">
              <div v-for="c in sortedLevelCards" :key="c.id" class="cc-card" :class="rarityClass(c.rarity)">
                <div class="cc-elixir" v-if="c.elixirCost">{{ c.elixirCost }}</div>
                <div class="cc-img-wrap">
                  <img :src="cardImage(c.name, c.evolutionLevel??0, c.starLevel??0)" :alt="c.name"
                    @error="(e:any)=>e.target.src=c.iconUrls?.medium??''" />
                  <span class="cc-lvl-badge">Lvl {{ displayLevel(c.level, c.rarity) }}</span>
                </div>
                <p class="cc-name">{{ c.name }}</p>
                <div class="cc-progress-wrap">
                  <div class="cc-progress-bar">
                    <div class="cc-progress-fill" :style="{ width: Math.min(c.level/c.maxLevel*100,100)+'%' }" />
                  </div>
                  <span class="cc-count">{{ c.count.toLocaleString() }}</span>
                </div>
                <div v-if="(c.starLevel ?? 0) > 0" class="cc-stars">
                  <span v-for="n in (c.starLevel ?? 0)" :key="n" class="cc-star filled">★</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 마스터리 -->
          <div v-if="cardSubTab === 'mastery'">
            <div v-if="masteryBadges.length === 0" class="empty">마스터리 데이터가 없습니다.</div>
            <div v-else class="cc-grid">
              <div v-for="b in masteryBadges" :key="b.name" class="cc-card mastery-card">
                <div class="cc-img-wrap mastery-img-wrap">
                  <img :src="b.iconUrls?.large ?? ''" :alt="b.name"
                    @error="(e:any)=>e.target.style.display='none'" />
                </div>
                <p class="cc-name">{{ badgeCardName(b.name) }}</p>
                <div class="mastery-level-row">
                  <span v-for="t in (b.maxLevel ?? 10)" :key="t"
                    class="mastery-pip" :class="{ achieved: t <= (b.level ?? 0) }" />
                </div>
                <span class="mastery-tier-label">Tier {{ b.level ?? 0 }} / {{ b.maxLevel ?? 10 }}</span>
                <div v-if="b.target" class="mastery-prog-wrap">
                  <div class="cc-progress-bar">
                    <div class="cc-progress-fill mastery-fill"
                      :style="{ width: Math.min((b.progress ?? 0) / b.target * 100, 100)+'%' }" />
                  </div>
                  <span class="cc-count">{{ b.progress }}/{{ b.target }}</span>
                </div>
                <div v-else class="mastery-max-label">MAX</div>
              </div>
            </div>
          </div>

          <!-- 업그레이드 -->
          <div v-if="cardSubTab === 'upgrade'">
            <div class="cc-sort-row">
              <span class="cc-sort-label">Sort:</span>
              <select v-model="upgradeSort" class="cc-select">
                <option value="count-desc">보유수 ▼</option>
                <option value="count-asc">보유수 ▲</option>
                <option value="level-desc">Level ▼</option>
                <option value="level-asc">Level ▲</option>
                <option value="name">이름</option>
              </select>
            </div>
            <div v-if="upgradeCards.length === 0" class="empty">모든 카드가 최대 레벨입니다!</div>
            <div v-else class="cc-grid">
              <div v-for="c in upgradeCards" :key="c.id" class="cc-card" :class="rarityClass(c.rarity)">
                <div class="cc-elixir" v-if="c.elixirCost">{{ c.elixirCost }}</div>
                <div class="cc-img-wrap">
                  <img :src="cardImage(c.name, c.evolutionLevel??0, c.starLevel??0)" :alt="c.name"
                    @error="(e:any)=>e.target.src=c.iconUrls?.medium??''" />
                  <span class="cc-lvl-badge">Lvl {{ displayLevel(c.level, c.rarity) }}</span>
                </div>
                <p class="cc-name">{{ c.name }}</p>
                <p class="cc-gap">→ Lv {{ displayLevel(c.level + 1, c.rarity) }}</p>
                <div class="cc-progress-wrap">
                  <div class="cc-progress-bar">
                    <div class="cc-progress-fill"
                      :style="{ width: Math.min(c.count / upgradeCost(c.level) * 100, 100)+'%' }"
                      :class="{ 'fill-ready': c.count >= upgradeCost(c.level) }" />
                  </div>
                  <span class="cc-count" :class="{ 'count-ready': c.count >= upgradeCost(c.level) }">
                    {{ c.count.toLocaleString() }} / {{ upgradeCost(c.level).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ────────────────── 통계 ────────────────── -->
        <div v-if="activeTab === 'stats'">
          <!-- 팀 / Opponent 토글 -->
          <div class="st-toggle">
            <button :class="{ active: statSide === 'team' }" @click="statSide = 'team'">팀</button>
            <button :class="{ active: statSide === 'opp' }" @click="statSide = 'opp'">Opponent</button>
          </div>
          <h3 class="section-title" style="margin-bottom:12px">Own Cards</h3>
          <!-- 정렬 -->
          <div class="st-sort">
            <button v-for="s in sortOptions" :key="s.id" :class="{ active: statSort === s.id }"
              @click="statSort = s.id">{{ s.label }}</button>
          </div>
          <!-- 카드 그리드 -->
          <div v-if="sortedCardStats.length === 0" class="empty">전투 기록에서 카드 데이터를 불러오는 중...</div>
          <div v-else class="st-grid">
            <div v-for="c in sortedCardStats" :key="c.id" class="st-card">
              <div class="st-img-wrap">
                <img :src="cardImage(c.name, c.evolutionLevel)" :alt="c.name"
                  @error="(e:any)=>e.target.src=c.iconUrl" />
              </div>
              <div class="st-bars">
                <div class="st-bar-row">
                  <div class="st-bar pick" :style="{ width: Math.min(c.pickPct / maxPickPct * 100, 100)+'%' }" />
                </div>
                <div class="st-bar-row">
                  <div class="st-bar win" :style="{ width: c.winPct+'%' }" />
                </div>
              </div>
              <div class="st-info">
                <p class="st-stat">픽률 <b>{{ c.pickPct }}%</b></p>
                <p class="st-sub">{{ c.picked }} / {{ totalBattles }}</p>
                <p class="st-stat">승리 <b>{{ c.winPct }}%</b></p>
                <p class="st-sub">{{ c.won }} / {{ c.picked }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { cardImage, arenaImage, displayLevel } from '@/utils/cardAsset'
import type { Badge, CardEntry } from '@/api/player'
import { useRecentTags } from '@/composables/useRecentTags'
import BattleCard from '@/components/BattleCard.vue'
import CardChip from '@/components/CardChip.vue'
import StatBadge from '@/components/StatBadge.vue'
import WinRateBar from '@/components/WinRateBar.vue'

const route = useRoute()
const router = useRouter()
const store = usePlayerStore()
const { tags: recentTags, add: addRecent, remove } = useRecentTags()

const searchTag = ref('')
const navFocused = ref(false)
const activeTab = ref('home')

const navFilteredTags = computed(() => {
  const q = searchTag.value.replace(/^#/, '').toUpperCase()
  return q ? recentTags.value.filter(t => t.tag.includes(q) || t.name.toUpperCase().includes(q)) : recentTags.value
})

function onNavBlur() {
  setTimeout(() => { navFocused.value = false }, 150)
}

function navPickTag(t: string) {
  searchTag.value = t
  router.push(`/player/%23${t}`)
}
const cardSubTab = ref('level')
const levelSort = ref('level-desc')
const upgradeSort = ref('count-desc')
const statSide = ref<'team'|'opp'>('team')
const statSort = ref('pick-desc')
const scrollSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const tabs = [
  { id: 'home', label: '🏠 홈' },
  { id: 'battles', label: '전투' },
  { id: 'decks', label: '덱' },
  { id: 'cards', label: '카드' },
  { id: 'stats', label: '통계' },
]
const cardSubTabs = [
  { id: 'level', label: '레벨' },
  { id: 'mastery', label: '마스터리' },
  { id: 'upgrade', label: '업그레이드' },
]

// masteries are derived from profile.badges — no separate API call needed
const sortOptions = [
  { id: 'pick-desc', label: '픽률 ▼' },
  { id: 'pick-asc', label: '픽률 ▲' },
  { id: 'win-desc', label: '승리 ▼' },
  { id: 'win-asc', label: '승리 ▲' },
]

const tag = computed(() => decodeURIComponent(route.params.tag as string))


onMounted(() => {
  store.load(tag.value)
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) store.loadMore(tag.value)
  }, { rootMargin: '200px' })
})
onUnmounted(() => observer?.disconnect())
watch(scrollSentinel, el => { observer?.disconnect(); if (el) observer?.observe(el) })
watch(tag, v => store.load(v))
watch(() => store.profile, p => { if (p) addRecent(p.tag, p.name) })

function goSearch() {
  const clean = searchTag.value.trim().replace(/^#/, '').toUpperCase()
  if (!clean) return
  router.push(`/player/%23${clean}`)
}
function clanRoleLabel(role: string) {
  return ({ member:'멤버', elder:'장로', coLeader:'공동대표', leader:'대표' } as Record<string,string>)[role] ?? role
}
// 카드 이름 → /chr/{slug}_dl.png
function chrImage(name: string): string {
  const slug = name.toLowerCase().replace(/['.]/g, '').replace(/\s+/g, '_').replace(/-+/g, '_')
  return `/chr/${slug}_dl.png`
}

// "MasteryHogRider" → "Hog Rider"
function badgeCardName(name: string): string {
  return name.replace('Mastery', '').replace(/([A-Z])/g, ' $1').trim()
}

function rarityClass(rarity: string) {
  return `rarity-${rarity?.toLowerCase() ?? 'common'}`
}
function pct(n: number, total: number) {
  return total > 0 ? Math.round(n / total * 100) : 0
}

// ── 승률 ──
const winRate = computed(() => {
  const p = store.profile; if (!p) return '-'
  const t = p.wins + p.losses
  return t > 0 ? `${Math.round(p.wins/t*100)}%` : '-'
})
const winPct = computed(() => {
  const p = store.profile!; const t = p.wins + p.losses
  return t > 0 ? (p.wins/t*100).toFixed(3) : '0'
})
const lossPct = computed(() => {
  const p = store.profile!; const t = p.wins + p.losses
  return t > 0 ? (p.losses/t*100).toFixed(3) : '0'
})

// ── 카드 분류 ──

// Tower cards: profile.supportCards에서 직접 가져옴
const towerCards = computed(() => store.profile?.supportCards ?? [])

// evolutionLevel: 2=히어로 보유, 3=진화+히어로 보유
const heroCards    = computed(() => (store.profile?.cards ?? []).filter(c => c.evolutionLevel === 2 || c.evolutionLevel === 3))
// evo: 진화 가능한 카드(maxEvolutionLevel 1 or 3) 중 실제 진화 보유(evolutionLevel > 0)
const evoCards     = computed(() => (store.profile?.cards ?? []).filter(c =>
  ((c.maxEvolutionLevel ?? 0) === 1 || (c.maxEvolutionLevel ?? 0) === 3) && (c.evolutionLevel ?? 0) > 0))
const regularCards = computed(() => (store.profile?.cards ?? []).filter(c => c.rarity !== 'champion'))

// Card ID → rarity map (from profile) so battle/deck cards can get correct level offsets
const cardRarityMap = computed(() => {
  const map = new Map<number, string>()
  store.profile?.cards?.forEach(c => map.set(c.id, c.rarity ?? 'common'))
  store.profile?.currentDeck?.forEach(c => map.set(c.id, c.rarity ?? 'common'))
  return map
})

// ── 마스터리 배지 (profile.badges에서 "Mastery" 접두어 필터링) ──
const masteryBadges = computed<Badge[]>(() =>
  (store.profile?.badges ?? []).filter(b => b.name.startsWith('Mastery'))
)

// ── 컬렉션 레벨 그룹 (표시 레벨 기준) ──
const levelGroups = computed(() => {
  const map = new Map<number, CardEntry[]>()
  regularCards.value.forEach(c => {
    const lvl = displayLevel(c.level, c.rarity)
    if (!map.has(lvl)) map.set(lvl, [])
    map.get(lvl)!.push(c)
  })
  return [...map.entries()].sort((a,b) => b[0]-a[0]).map(([level,cards]) => ({level,cards}))
})
const maxCardLevel = computed(() => levelGroups.value[0]?.level ?? 14)

const LEVEL_COLORS: Record<number, string> = {
  16:'#E8136B', 15:'#1A2880', 14:'#7B0A24', 13:'#5B2D8E',
  12:'#0E7A7A', 11:'#C9A000', 10:'#D4890A', 9:'#B87840',
}
function levelColor(level: number, idx: number) {
  return LEVEL_COLORS[level] ?? `hsl(${idx*25},50%,35%)`
}

// ── 카드 컬렉션 정렬 ──
const sortedLevelCards = computed(() => {
  const cards = [...regularCards.value]
  if (levelSort.value === 'level-desc') return cards.sort((a,b) => displayLevel(b.level,b.rarity) - displayLevel(a.level,a.rarity))
  if (levelSort.value === 'level-asc')  return cards.sort((a,b) => displayLevel(a.level,a.rarity) - displayLevel(b.level,b.rarity))
  return cards.sort((a,b) => a.name.localeCompare(b.name))
})

// 상대 레벨 1→2, 2→3 ... 순서 업그레이드 필요 카드 수
const UPGRADE_COST: Record<number, number> = {
  1: 2, 2: 4, 3: 10, 4: 20, 5: 50, 6: 100,
  7: 200, 8: 400, 9: 800, 10: 1000, 11: 2000, 12: 5000, 13: 10000,
}
function upgradeCost(level: number): number {
  return UPGRADE_COST[level] ?? 99999
}

const upgradeCards = computed(() => {
  const cards = regularCards.value.filter(c => c.level < c.maxLevel)
  if (upgradeSort.value === 'count-desc') return cards.sort((a,b) => b.count - a.count)
  if (upgradeSort.value === 'count-asc')  return cards.sort((a,b) => a.count - b.count)
  if (upgradeSort.value === 'level-desc') return cards.sort((a,b) => displayLevel(b.level,b.rarity) - displayLevel(a.level,a.rarity))
  if (upgradeSort.value === 'level-asc')  return cards.sort((a,b) => displayLevel(a.level,a.rarity) - displayLevel(b.level,b.rarity))
  return cards.sort((a,b) => a.name.localeCompare(b.name))
})

// ── 전투 픽률/승률 통계 ──
const totalBattles = computed(() => store.battles.length)

const cardStatsMap = computed(() => {
  const map = new Map<number, { id:number; name:string; level:number; evolutionLevel:number; picked:number; won:number; iconUrl:string; pickPct:number; winPct:number }>()
  store.battles.forEach(b => {
    const side = statSide.value === 'team' ? b.team?.[0] : b.opponent?.[0]
    const teamSide = b.team?.[0]
    const oppSide  = b.opponent?.[0]
    if (!side || !teamSide || !oppSide) return
    const won = teamSide.crowns > oppSide.crowns
    const didWin = statSide.value === 'team' ? won : !won
    side.cards?.forEach(c => {
      if (!map.has(c.id)) map.set(c.id, { id:c.id, name:c.name, level:c.level, evolutionLevel:c.evolutionLevel??0, picked:0, won:0, iconUrl:c.iconUrls?.medium??'', pickPct:0, winPct:0 })
      const s = map.get(c.id)!
      s.picked++
      if (didWin) s.won++
    })
  })
  // 퍼센트 계산
  const total = totalBattles.value
  map.forEach(s => {
    s.pickPct = total > 0 ? Math.round(s.picked/total*100) : 0
    s.winPct  = s.picked > 0 ? Math.round(s.won/s.picked*100) : 0
  })
  return map
})

const sortedCardStats = computed(() => {
  const arr = [...cardStatsMap.value.values()]
  if (statSort.value === 'pick-desc') return arr.sort((a,b)=>b.picked-a.picked)
  if (statSort.value === 'pick-asc')  return arr.sort((a,b)=>a.picked-b.picked)
  if (statSort.value === 'win-desc')  return arr.sort((a,b)=>b.winPct-a.winPct)
  return arr.sort((a,b)=>a.winPct-b.winPct)
})

const maxPickPct = computed(() => Math.max(...sortedCardStats.value.map(c=>c.pickPct), 1))

// ── 덱 정리 ──
const deckStats = computed(() => {
  const map = new Map<string, { cards: any[]; played: number; won: number }>()
  store.battles.forEach(b => {
    const me = b.team?.[0]; const opp = b.opponent?.[0]
    if (!me || !opp) return
    const won = me.crowns > opp.crowns
    const key = [...(me.cards ?? [])].map(c=>c.id).sort().join('-')
    if (!map.has(key)) map.set(key, {
      cards: me.cards?.map(c=>({ id:c.id, name:c.name, level:c.level,
        evolutionLevel:c.evolutionLevel??0, elixirCost:c.elixirCost??0,
        starLevel:c.starLevel??0, rarity:cardRarityMap.value.get(c.id)??'common',
        iconUrl:c.iconUrls?.medium??'' })) ?? [],
      played:0, won:0,
    })
    const d = map.get(key)!; d.played++; if (won) d.won++
  })
  return [...map.values()].sort((a,b)=>b.played-a.played)
})
</script>

<style scoped>
.player-page { min-height: 100vh; background: var(--bg); }

/* NAV */
.top-nav { position:sticky; top:0; z-index:100; display:flex; align-items:center; gap:16px; padding:12px 24px; background:rgba(15,22,35,0.95); border-bottom:1px solid var(--border); backdrop-filter:blur(10px); }
.nav-logo { font-family:'Cinzel',serif; font-weight:700; font-size:1.1rem; color:var(--gold); }
.nav-search-wrap { position:relative; margin-left:auto; }
.nav-search { display:flex; align-items:center; background:var(--card-bg); border:1px solid var(--border); border-radius:8px; overflow:hidden; transition:border-color 0.2s; }
.nav-search.focused { border-color:var(--gold); }
.nav-hash { padding:0 4px 0 12px; font-family:'Rajdhani',sans-serif; font-weight:700; color:var(--gold); }
.nav-input { background:none; border:none; outline:none; padding:8px 12px; font-family:'Rajdhani',sans-serif; font-size:0.95rem; color:var(--text); width:200px; }
.nav-dropdown { position:absolute; top:calc(100% + 4px); right:0; min-width:220px; background:var(--card-bg); border:1px solid var(--border); border-radius:8px; overflow:hidden; z-index:200; box-shadow:0 8px 24px rgba(0,0,0,0.4); }
.nav-dd-item { display:flex; align-items:center; gap:6px; padding:8px 12px; cursor:pointer; transition:background 0.15s; }
.nav-dd-item:hover { background:var(--surface); }
.nav-dd-info { flex:1; display:flex; flex-direction:column; gap:1px; }
.nav-dd-name { font-family:'Rajdhani',sans-serif; font-size:0.9rem; font-weight:700; color:var(--text); line-height:1.2; }
.nav-dd-tag { font-family:'Rajdhani',sans-serif; font-size:0.75rem; font-weight:500; letter-spacing:0.06em; color:var(--text-dim); }
.nav-dd-remove { background:none; border:none; color:var(--text-dim); cursor:pointer; font-size:0.7rem; padding:2px 4px; border-radius:4px; line-height:1; transition:color 0.15s, background 0.15s; }
.nav-dd-remove:hover { color:var(--loss); background:rgba(231,76,60,0.1); }

/* STATE */
.state-center { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; min-height:60vh; color:var(--text-dim); }
.spinner { width:40px; height:40px; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:spin 0.8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.err-text { color:var(--loss); font-size:1.1rem; }
.btn-back { color:var(--gold); font-family:'Rajdhani',sans-serif; padding:8px 20px; border:1px solid var(--gold); border-radius:6px; }

/* HEADER */
.profile-header { background:linear-gradient(180deg,rgba(45,107,228,0.15) 0%,transparent 100%); border-bottom:1px solid var(--border); padding:24px; }
.header-inner { max-width:960px; margin:0 auto; display:flex; align-items:center; gap:24px; }
.arena-wrap { flex-shrink:0; }
.arena-img { width:88px; height:88px; object-fit:contain; filter:drop-shadow(0 4px 12px rgba(45,107,228,0.4)); }
.player-info { flex:1; }
.player-name-row { display:flex; align-items:baseline; gap:12px; margin-bottom:12px; flex-wrap:wrap; }
.player-name { font-family:'Cinzel',serif; font-size:1.8rem; font-weight:700; color:var(--text); }
.clan-tag { font-family:'Rajdhani',sans-serif; font-size:0.9rem; color:var(--text-dim); background:var(--card-bg); border:1px solid var(--border); padding:2px 10px; border-radius:20px; display:flex; align-items:center; gap:6px; }
.clan-role { color:var(--gold); font-weight:700; }
.player-stats { display:flex; flex-wrap:wrap; gap:8px; }

/* TABS */
.tabs-wrap { background:var(--surface); border-bottom:1px solid var(--border); position:sticky; top:53px; z-index:90; }
.tabs { max-width:960px; margin:0 auto; display:flex; padding:0 24px; overflow-x:auto; }
.tab-btn { background:none; border:none; cursor:pointer; padding:14px 20px; font-family:'Rajdhani',sans-serif; font-size:1rem; font-weight:600; color:var(--text-dim); border-bottom:2px solid transparent; transition:all 0.2s; white-space:nowrap; }
.tab-btn:hover { color:var(--text); }
.tab-btn.active { color:var(--gold); border-bottom-color:var(--gold); }

/* CONTENT */
.tab-content { max-width:960px; margin:0 auto; padding:24px; }
.empty { text-align:center; color:var(--text-dim); padding:48px; }
.section { margin-bottom:32px; }
.section-title { font-family:'Cinzel',serif; font-size:1rem; font-weight:700; color:var(--text); margin-bottom:14px; text-transform:uppercase; letter-spacing:0.05em; }

/* CURRENT DECK */
.current-deck { display:grid; grid-template-columns:repeat(8,1fr); gap:6px; max-width:720px; }
.deck-card { position:relative; aspect-ratio:6/7; overflow:hidden; }
.deck-card img {
  position:absolute; top:0; left:0;
  width:100%; height:100%;
  object-fit:cover;
}
.deck-card-lv {
  position:absolute; bottom:0; left:0; right:0; z-index:1;
  background:rgba(0,0,0,0.75); color:var(--gold);
  font-family:'Rajdhani',sans-serif; font-size:0.8rem; font-weight:700;
  text-align:center; padding:2px 0;
}
.deck-card-evo { position:absolute; top:2px; right:3px; font-size:0.75rem; z-index:1; }

/* COLLECTION CHIPS */
.coll-row { display:flex; flex-wrap:wrap; gap:6px; }
.coll-chip { position:relative; width:52px; height:60px; border-radius:6px; overflow:hidden; border:2px solid var(--border); }
.coll-chip img { width:100%; height:100%; object-fit:contain; display:block; }
.coll-lv { position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.75); color:var(--gold); font-family:'Rajdhani',sans-serif; font-size:0.7rem; font-weight:700; text-align:center; padding:1px 0; }
.coll-over { border-color:var(--loss) !important; }

/* HERO COLLECTION */
.hero-row { display:flex; flex-wrap:wrap; gap:16px; }
.hero-chip {
  display:flex; flex-direction:column; align-items:center;
  width:128px; gap:0;
}
.hero-chip img { width:128px; height:128px; object-fit:contain; display:block; }
.hero-info { width:100%; text-align:center; margin-top:4px; }
.hero-name { display:block; font-family:'Rajdhani',sans-serif; font-size:0.85rem; font-weight:700; color:var(--text); line-height:1.2; }
.hero-lv { display:block; font-family:'Rajdhani',sans-serif; font-size:0.8rem; color:var(--gold); font-weight:600; }
.hero-stars { color:#F59E0B; font-size:0.75rem; line-height:1; margin-top:2px; }

/* RARITY BORDERS */
.rarity-common    { border-color:#888888; }
.rarity-rare      { border-color:#FF8C00; }
.rarity-epic      { border-color:#A020F0; }
.rarity-legendary { border-color:#FFD700; }
.rarity-champion  { border-color:#FF1493; }

/* LEVEL BAR */
.level-bar { display:flex; height:20px; border-radius:4px; overflow:hidden; margin-bottom:8px; }
.level-bar-seg { height:100%; min-width:2px; }
.level-badges { display:flex; flex-wrap:wrap; gap:3px; margin-bottom:24px; }
.level-badge { display:flex; flex-direction:column; align-items:center; padding:4px 8px; border-radius:4px; min-width:44px; }
.lbadge-lv { font-family:'Rajdhani',sans-serif; font-size:0.9rem; font-weight:700; color:#fff; }
.lbadge-pct { font-family:'Rajdhani',sans-serif; font-size:0.75rem; color:rgba(255,255,255,0.8); }

/* LEVEL GROUP */
.level-group { margin-bottom:24px; }
.level-group-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.lg-title { font-family:'Rajdhani',sans-serif; font-size:1rem; font-weight:700; color:var(--text); }
.lg-max { font-family:'Rajdhani',sans-serif; font-size:0.8rem; color:var(--gold); background:rgba(212,169,10,0.15); padding:1px 8px; border-radius:10px; }
.lg-stats { display:flex; gap:24px; margin-bottom:8px; flex-wrap:wrap; }
.lg-stat { font-family:'Rajdhani',sans-serif; font-size:0.85rem; color:var(--text-dim); }
.lg-stat b { color:var(--text); }

/* 2-COL STATS */
.stats-layout { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:8px; }
@media(max-width:640px) { .stats-layout { grid-template-columns:1fr; } }
.stats-col { display:flex; flex-direction:column; gap:16px; }
.stat-block { background:var(--card-bg); border:1px solid var(--border); border-radius:10px; padding:20px; }
.stat-block-title { font-family:'Cinzel',serif; font-size:0.95rem; font-weight:700; color:var(--text); margin-bottom:16px; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid var(--border); padding-bottom:10px; }
.ranked-section { margin-bottom:14px; }
.ranked-label { font-family:'Rajdhani',sans-serif; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-dim); margin-bottom:4px; font-weight:700; }
.ranked-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-family:'Rajdhani',sans-serif; font-size:0.9rem; }
.ranked-row span:first-child { color:var(--text-dim); }
.ranked-row span:last-child { font-weight:600; color:var(--text); }
.ranked-row span.gold { color:var(--gold); }
.gold { color:var(--gold); }
.kv-sub { font-family:'Rajdhani',sans-serif; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-dim); margin:12px 0 4px; font-weight:700; }
.kv-list { display:flex; flex-direction:column; }
.kv-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-family:'Rajdhani',sans-serif; font-size:0.9rem; }
.kv-row span:first-child { color:var(--text-dim); }
.kv-row span:last-child { color:var(--text); font-weight:600; }
.battle-table { margin-top:12px; }
.bt-head { display:grid; grid-template-columns:1fr 80px 80px; gap:4px; padding:4px 0 6px; border-bottom:1px solid var(--border); font-family:'Rajdhani',sans-serif; font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; }
.bt-row { display:grid; grid-template-columns:1fr 80px 80px; gap:4px; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-family:'Rajdhani',sans-serif; font-size:0.9rem; color:var(--text); }
.bt-row span:not(:first-child) { font-weight:600; }
.bt-row.win-row span:first-child { color:var(--win); font-weight:700; }
.bt-row.loss-row span:first-child { color:var(--loss); font-weight:700; }

/* BATTLE */
.battle-list { display:flex; flex-direction:column; gap:8px; }
.sentinel { display:flex; justify-content:center; align-items:center; padding:24px; min-height:60px; }
.spinner-sm { width:24px; height:24px; border:2px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:spin 0.8s linear infinite; }
.no-more { font-family:'Rajdhani',sans-serif; font-size:0.85rem; color:var(--text-dim); }

/* DECK */
.deck-list { display:flex; flex-direction:column; gap:8px; }
.deck-row { background:var(--card-bg); border:1px solid var(--border); border-radius:10px; padding:12px 16px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.deck-cards { display:flex; gap:4px; flex-wrap:wrap; }
.deck-meta { display:flex; align-items:center; gap:12px; margin-left:auto; }
.deck-played { font-family:'Rajdhani',sans-serif; font-size:0.9rem; color:var(--text-dim); white-space:nowrap; }

/* CARD COLLECTION */
.subtabs { display:flex; gap:4px; margin-bottom:20px; border-bottom:1px solid var(--border); }
.subtab-btn { background:none; border:none; cursor:pointer; padding:10px 18px; font-family:'Rajdhani',sans-serif; font-size:0.95rem; font-weight:600; color:var(--text-dim); border-bottom:2px solid transparent; transition:all 0.2s; }
.subtab-btn.active { color:var(--gold); border-bottom-color:var(--gold); }
.cc-sort-row { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
.cc-sort-label { font-family:'Rajdhani',sans-serif; font-size:0.85rem; color:var(--text-dim); }
.cc-select { background:var(--card-bg); border:1px solid var(--border); color:var(--text); padding:4px 10px; border-radius:6px; font-family:'Rajdhani',sans-serif; font-size:0.9rem; cursor:pointer; }

.cc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); gap:10px; }
.cc-card { position:relative; display:flex; flex-direction:column; align-items:center; border-radius:8px; border:2px solid var(--border); background:var(--card-bg); padding:4px 4px 8px; gap:4px; transition:border-color 0.2s; }
.cc-card.rarity-common    { border-color:#888; }
.cc-card.rarity-rare      { border-color:#FF8C00; }
.cc-card.rarity-epic      { border-color:#A020F0; }
.cc-card.rarity-legendary { border-color:#FFD700; }
.cc-card.rarity-champion  { border-color:#FF1493; }

.cc-elixir { position:absolute; top:4px; left:4px; width:18px; height:18px; background:#8B4DC8; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Rajdhani',sans-serif; font-size:0.7rem; font-weight:700; color:#fff; z-index:1; }
.cc-img-wrap { position:relative; width:70px; height:80px; }
.cc-img-wrap img { width:100%; height:100%; object-fit:contain; display:block; }
.cc-lvl-badge { position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.75); color:var(--gold); font-family:'Rajdhani',sans-serif; font-size:0.65rem; font-weight:700; text-align:center; padding:1px 0; }
.cc-name { font-family:'Rajdhani',sans-serif; font-size:0.65rem; color:var(--text-dim); text-align:center; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cc-progress-wrap { width:100%; }
.cc-progress-bar { height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden; margin-bottom:2px; }
.cc-progress-fill { height:100%; background:#3B82F6; border-radius:2px; transition:width 0.3s; }
.cc-count { font-family:'Rajdhani',sans-serif; font-size:0.65rem; color:var(--text-dim); display:block; text-align:center; }
.cc-stars { display:flex; gap:1px; justify-content:center; }
.cc-star { font-size:0.7rem; color:#FFD700; }
.mastery-img-wrap { width:72px; height:72px; margin:0 auto 4px; }
.mastery-img-wrap img { width:100%; height:100%; object-fit:contain; }
.mastery-level-row { display:flex; gap:3px; justify-content:center; flex-wrap:wrap; margin:4px 0 2px; }
.mastery-pip { width:8px; height:8px; border-radius:50%; background:var(--border); }
.mastery-pip.achieved { background:#F59E0B; }
.mastery-tier-label { font-size:0.65rem; color:var(--text-dim); font-family:'Rajdhani',sans-serif; }
.mastery-prog-wrap { width:100%; }
.cc-progress-fill.mastery-fill { background:#F59E0B; }
.mastery-max-label { font-size:0.7rem; font-weight:700; color:#F59E0B; font-family:'Rajdhani',sans-serif; }
.cc-gap { font-family:'Rajdhani',sans-serif; font-size:0.65rem; color:var(--win); margin-top:2px; }
.fill-ready { background: var(--win) !important; }
.count-ready { color: var(--win) !important; }

/* 통계 탭 */
.st-toggle { display:flex; gap:8px; margin-bottom:16px; }
.st-toggle button { background:var(--card-bg); border:1px solid var(--border); color:var(--text-dim); padding:6px 16px; border-radius:6px; cursor:pointer; font-family:'Rajdhani',sans-serif; font-size:0.9rem; font-weight:600; transition:all 0.2s; }
.st-toggle button.active { border-color:var(--gold); color:var(--gold); }
.st-sort { display:flex; gap:4px; margin-bottom:20px; border-bottom:1px solid var(--border); }
.st-sort button { background:none; border:none; cursor:pointer; padding:8px 14px; font-family:'Rajdhani',sans-serif; font-size:0.85rem; font-weight:600; color:var(--text-dim); border-bottom:2px solid transparent; transition:all 0.2s; }
.st-sort button.active { color:var(--gold); border-bottom-color:var(--gold); }
.st-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(80px,1fr)); gap:8px; }
.st-card { display:flex; flex-direction:column; align-items:center; background:var(--card-bg); border:1px solid var(--border); border-radius:8px; padding:6px 4px 8px; gap:4px; }
.st-img-wrap { width:56px; height:64px; }
.st-img-wrap img { width:100%; height:100%; object-fit:contain; }
.st-bars { width:100%; display:flex; flex-direction:column; gap:2px; }
.st-bar-row { height:4px; background:rgba(255,255,255,0.08); border-radius:2px; overflow:hidden; }
.st-bar.pick { height:100%; background:#3B82F6; border-radius:2px; }
.st-bar.win  { height:100%; background:#22C55E; border-radius:2px; }
.st-info { width:100%; }
.st-stat { font-family:'Rajdhani',sans-serif; font-size:0.7rem; color:var(--text-dim); }
.st-stat b { color:var(--text); font-size:0.85rem; }
.st-sub { font-family:'Rajdhani',sans-serif; font-size:0.65rem; color:var(--text-dim); }
</style>

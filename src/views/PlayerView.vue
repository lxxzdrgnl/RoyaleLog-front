<template>
  <div class="player-page">
    <!-- NAV -->
    <nav class="top-nav">
      <RouterLink to="/" class="nav-logo">
        <img src="/arenas/legendary.png" alt="" />
        <span>RoyaleLog</span>
      </RouterLink>
      <form class="nav-search" @submit.prevent="goSearch">
        <span class="nav-hash">#</span>
        <input v-model="searchTag" placeholder="태그 검색..." class="nav-input" />
      </form>
    </nav>

    <!-- LOADING / ERROR -->
    <div v-if="store.loading" class="state-center">
      <div class="spinner" />
      <p>데이터 불러오는 중...</p>
    </div>
    <div v-else-if="store.error" class="state-center">
      <p class="err-text">{{ store.error }}</p>
      <RouterLink to="/" class="btn-back">← 돌아가기</RouterLink>
    </div>

    <!-- CONTENT -->
    <div v-else-if="store.profile" class="main">
      <!-- PROFILE HEADER -->
      <header class="profile-header">
        <div class="header-inner">
          <div class="arena-wrap">
            <img :src="arenaImage(store.profile.arena?.id ?? 22)" class="arena-img" alt="arena" />
          </div>
          <div class="player-info">
            <div class="player-name-row">
              <h2 class="player-name">{{ store.profile.name }}</h2>
              <span v-if="store.profile.clan" class="clan-tag">{{ store.profile.clan.name }}</span>
            </div>
            <div class="player-stats">
              <StatBadge icon="🏆" :value="store.profile.trophies.toLocaleString()" label="트로피" gold />
              <StatBadge icon="⚔️" :value="store.profile.wins.toLocaleString()" label="승리" />
              <StatBadge icon="💀" :value="store.profile.losses.toLocaleString()" label="패배" />
              <StatBadge icon="👑" :value="winRate" label="승률" />
              <StatBadge icon="⭐" :value="`Lv.${store.profile.expLevel}`" label="레벨" />
            </div>
          </div>
        </div>
      </header>

      <!-- TABS -->
      <div class="tabs-wrap">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >{{ tab.label }}</button>
        </div>
      </div>

      <!-- TAB CONTENT -->
      <div class="tab-content">
        <!-- 전투 기록 -->
        <div v-if="activeTab === 'battles'">
          <div v-if="store.battles.length === 0" class="empty">전투 기록이 없습니다.</div>
          <div v-else class="battle-list">
            <BattleCard
              v-for="battle in store.battles"
              :key="battle.battleTime"
              :battle="battle"
              :my-tag="store.profile!.tag"
            />
          </div>
        </div>

        <!-- 사용한 덱 정리 -->
        <div v-if="activeTab === 'decks'">
          <div class="deck-list">
            <div
              v-for="(deck, i) in deckStats"
              :key="i"
              class="deck-row"
            >
              <div class="deck-cards">
                <CardChip
                  v-for="card in deck.cards"
                  :key="card.id"
                  :card="card"
                  size="md"
                />
              </div>
              <div class="deck-meta">
                <span class="deck-played">{{ deck.played }}전</span>
                <WinRateBar :rate="deck.played > 0 ? deck.won / deck.played : 0" />
              </div>
            </div>
          </div>
        </div>

        <!-- 카드 -->
        <div v-if="activeTab === 'cards'">
          <div class="card-stats-grid">
            <div
              v-for="card in cardStats"
              :key="card.id"
              class="card-stat-item"
            >
              <div class="cs-card-img">
                <img
                  :src="cardImage(card.name, card.evolutionLevel)"
                  :alt="card.name"
                  @error="(e: any) => e.target.src = card.iconUrl"
                />
                <div class="cs-level">{{ card.level }}</div>
              </div>
              <div class="cs-info">
                <p class="cs-name">{{ card.name }}</p>
                <div class="cs-rate-row">
                  <div class="cs-icon">
                    <img src="/trade-tokens/tt-common.png" alt="" />
                  </div>
                  <div>
                    <p class="cs-rate-label">픽률</p>
                    <p class="cs-rate-val">{{ Math.round(card.picked / totalBattles * 100) }}%</p>
                    <p class="cs-rate-sub">{{ card.picked }} / {{ totalBattles }}</p>
                  </div>
                  <div class="cs-sep" />
                  <div>
                    <p class="cs-rate-label">승률</p>
                    <p class="cs-rate-val win">{{ card.picked > 0 ? Math.round(card.won / card.picked * 100) : 0 }}%</p>
                    <p class="cs-rate-sub">{{ card.won }} / {{ card.picked }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 통계 -->
        <div v-if="activeTab === 'stats'">
          <div class="stats-grid">
            <div class="stat-card">
              <p class="stat-label">총 전투</p>
              <p class="stat-value">{{ store.profile.battleCount.toLocaleString() }}</p>
            </div>
            <div class="stat-card">
              <p class="stat-label">승리</p>
              <p class="stat-value win">{{ store.profile.wins.toLocaleString() }}</p>
            </div>
            <div class="stat-card">
              <p class="stat-label">패배</p>
              <p class="stat-value loss">{{ store.profile.losses.toLocaleString() }}</p>
            </div>
            <div class="stat-card">
              <p class="stat-label">승률</p>
              <p class="stat-value gold">{{ winRate }}</p>
            </div>
            <div class="stat-card">
              <p class="stat-label">최고 트로피</p>
              <p class="stat-value gold">{{ store.profile.bestTrophies.toLocaleString() }} 🏆</p>
            </div>
            <div class="stat-card">
              <p class="stat-label">3크라운 승리</p>
              <p class="stat-value">{{ store.profile.threeCrownWins.toLocaleString() }} 👑</p>
            </div>
          </div>

          <!-- Current Deck -->
          <div v-if="store.profile.currentDeck?.length" class="current-deck-section">
            <h3 class="section-title">현재 덱</h3>
            <div class="current-deck">
              <CardChip
                v-for="card in store.profile.currentDeck"
                :key="card.id"
                :card="{ id: card.id, name: card.name, level: card.level, evolutionLevel: card.evolutionLevel ?? 0, elixirCost: 0, iconUrl: card.iconUrls?.medium ?? '' }"
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { cardImage, arenaImage } from '@/utils/cardAsset'
import BattleCard from '@/components/BattleCard.vue'
import CardChip from '@/components/CardChip.vue'
import StatBadge from '@/components/StatBadge.vue'
import WinRateBar from '@/components/WinRateBar.vue'

const route = useRoute()
const router = useRouter()
const store = usePlayerStore()
const searchTag = ref('')
const activeTab = ref('battles')

const tabs = [
  { id: 'battles', label: '전투 기록' },
  { id: 'decks', label: '사용한 덱 정리' },
  { id: 'cards', label: '카드' },
  { id: 'stats', label: '통계' },
]

const tag = computed(() => decodeURIComponent(route.params.tag as string))

onMounted(() => { store.load(tag.value) })
watch(tag, (v) => store.load(v))

function goSearch() {
  const clean = searchTag.value.trim().replace(/^#/, '').toUpperCase()
  if (clean) router.push(`/player/%23${clean}`)
}

const winRate = computed(() => {
  const p = store.profile
  if (!p) return '-'
  const total = p.wins + p.losses
  return total > 0 ? `${Math.round(p.wins / total * 100)}%` : '-'
})

const totalBattles = computed(() => store.battles.length)

const cardStats = computed(() => {
  const map = new Map<number, { id: number; name: string; level: number; evolutionLevel: number; picked: number; won: number; iconUrl: string }>()
  store.battles.forEach(b => {
    const me = b.team?.[0]
    const opp = b.opponent?.[0]
    if (!me || !opp) return
    const won = me.crowns > opp.crowns
    me.cards?.forEach(c => {
      if (!map.has(c.id)) map.set(c.id, { id: c.id, name: c.name, level: c.level, evolutionLevel: c.evolutionLevel ?? 0, picked: 0, won: 0, iconUrl: c.iconUrls?.medium ?? '' })
      const s = map.get(c.id)!
      s.picked++
      if (won) s.won++
    })
  })
  return [...map.values()].sort((a, b) => b.picked - a.picked)
})

const deckStats = computed(() => {
  const map = new Map<string, { cards: any[]; played: number; won: number }>()
  store.battles.forEach(b => {
    const me = b.team?.[0]
    const opp = b.opponent?.[0]
    if (!me || !opp) return
    const won = me.crowns > opp.crowns
    const key = [...(me.cards ?? [])].map(c => c.id).sort().join('-')
    if (!map.has(key)) map.set(key, { cards: me.cards?.map(c => ({ id: c.id, name: c.name, level: c.level, evolutionLevel: c.evolutionLevel ?? 0, elixirCost: c.elixirCost ?? 0, iconUrl: c.iconUrls?.medium ?? '' })) ?? [], played: 0, won: 0 })
    const d = map.get(key)!
    d.played++
    if (won) d.won++
  })
  return [...map.values()].sort((a, b) => b.played - a.played)
})
</script>

<style scoped>
.player-page { min-height: 100vh; background: var(--bg); }

/* NAV */
.top-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 16px;
  padding: 12px 24px;
  background: rgba(15,22,35,0.95);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
}
.nav-logo { display: flex; align-items: center; gap: 8px; }
.nav-logo img { width: 28px; height: 28px; object-fit: contain; }
.nav-logo span { font-family: 'Cinzel', serif; font-weight: 700; font-size: 1.1rem; color: var(--gold); }
.nav-search { display: flex; align-items: center; background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-left: auto; }
.nav-hash { padding: 0 4px 0 12px; font-family: 'Rajdhani', sans-serif; font-weight: 700; color: var(--gold); }
.nav-input { background: none; border: none; outline: none; padding: 8px 12px; font-family: 'Rajdhani', sans-serif; font-size: 0.95rem; color: var(--text); width: 200px; }

/* STATES */
.state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; min-height: 60vh; color: var(--text-dim); }
.spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.err-text { color: var(--loss); font-size: 1.1rem; }
.btn-back { color: var(--gold); font-family: 'Rajdhani', sans-serif; font-size: 1rem; padding: 8px 20px; border: 1px solid var(--gold); border-radius: 6px; }

/* PROFILE HEADER */
.profile-header {
  background: linear-gradient(180deg, rgba(45,107,228,0.15) 0%, transparent 100%);
  border-bottom: 1px solid var(--border);
  padding: 24px;
}
.header-inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; gap: 24px; }
.arena-wrap { flex-shrink: 0; }
.arena-img { width: 88px; height: 88px; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(45,107,228,0.4)); }
.player-info { flex: 1; }
.player-name-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.player-name { font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: 700; color: var(--text); }
.clan-tag { font-family: 'Rajdhani', sans-serif; font-size: 0.9rem; color: var(--text-dim); background: var(--card-bg); border: 1px solid var(--border); padding: 2px 10px; border-radius: 20px; }
.player-stats { display: flex; flex-wrap: wrap; gap: 8px; }

/* TABS */
.tabs-wrap { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 53px; z-index: 90; }
.tabs { max-width: 900px; margin: 0 auto; display: flex; padding: 0 24px; }
.tab-btn { background: none; border: none; cursor: pointer; padding: 14px 20px; font-family: 'Rajdhani', sans-serif; font-size: 1rem; font-weight: 600; color: var(--text-dim); border-bottom: 2px solid transparent; transition: all 0.2s; }
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--gold); border-bottom-color: var(--gold); }

/* CONTENT */
.tab-content { max-width: 900px; margin: 0 auto; padding: 24px; }
.empty { text-align: center; color: var(--text-dim); padding: 48px; }

/* BATTLE LIST */
.battle-list { display: flex; flex-direction: column; gap: 8px; }

/* DECK LIST */
.deck-list { display: flex; flex-direction: column; gap: 8px; }
.deck-row {
  background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px;
  padding: 12px 16px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.deck-cards { display: flex; gap: 4px; flex-wrap: wrap; }
.deck-meta { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.deck-played { font-family: 'Rajdhani', sans-serif; font-size: 0.9rem; color: var(--text-dim); white-space: nowrap; }

/* CARD STATS */
.card-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; }
.card-stat-item {
  background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px;
  padding: 12px; display: flex; gap: 12px; align-items: center;
}
.cs-card-img { position: relative; flex-shrink: 0; }
.cs-card-img img { width: 52px; height: 60px; object-fit: contain; }
.cs-level {
  position: absolute; bottom: 0; right: 0;
  background: rgba(0,0,0,0.8); color: var(--gold);
  font-family: 'Rajdhani', sans-serif; font-size: 0.7rem; font-weight: 700;
  padding: 1px 4px; border-radius: 3px;
}
.cs-info { flex: 1; }
.cs-name { font-family: 'Rajdhani', sans-serif; font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cs-rate-row { display: flex; align-items: center; gap: 8px; }
.cs-icon img { width: 20px; height: 20px; object-fit: contain; }
.cs-rate-label { font-family: 'Rajdhani', sans-serif; font-size: 0.7rem; color: var(--text-dim); }
.cs-rate-val { font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--text); }
.cs-rate-val.win { color: var(--win); }
.cs-rate-sub { font-family: 'Rajdhani', sans-serif; font-size: 0.7rem; color: var(--text-dim); }
.cs-sep { width: 1px; height: 30px; background: var(--border); }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin-bottom: 32px; }
.stat-card {
  background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px;
  padding: 20px 16px; text-align: center;
}
.stat-label { font-family: 'Rajdhani', sans-serif; font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
.stat-value { font-family: 'Rajdhani', sans-serif; font-size: 1.6rem; font-weight: 700; }
.stat-value.win { color: var(--win); }
.stat-value.loss { color: var(--loss); }
.stat-value.gold { color: var(--gold); }

.section-title { font-family: 'Cinzel', serif; font-size: 1rem; color: var(--text-dim); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
.current-deck { display: flex; gap: 6px; flex-wrap: wrap; }
</style>

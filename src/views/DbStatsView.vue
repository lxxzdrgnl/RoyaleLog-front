<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchDbStats, type DbStats } from '@/api/batch'

const data = ref<DbStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try { data.value = await fetchDbStats() }
  catch (e: any) { error.value = e.message }
  finally { loading.value = false }
})

function fmtBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(0) + ' KB'
  if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB'
  return (b / 1073741824).toFixed(2) + ' GB'
}

function fmt(n: number) { return n.toLocaleString() }

// bracket을 trophy / pol / other로 분류
const trophyUsers = computed(() => data.value?.brackets.filter(b => b.bracket.startsWith('arena_')) ?? [])
const polUsers = computed(() => data.value?.brackets.filter(b => b.bracket.startsWith('pol_')) ?? [])
const otherUsers = computed(() => data.value?.brackets.filter(b => !b.bracket.startsWith('arena_') && !b.bracket.startsWith('pol_')) ?? [])

// 가장 큰 bracket의 count (바 비율 계산용)
const maxBracketCount = computed(() => {
  if (!data.value) return 1
  return Math.max(...data.value.brackets.map(b => b.count), 1)
})

function barWidth(count: number) {
  return Math.max(2, (count / maxBracketCount.value) * 100) + '%'
}

// 테이블 중 0 bytes 제외
const visibleTables = computed(() => data.value?.tables.filter(t => t.bytes > 0) ?? [])
const maxTableBytes = computed(() => Math.max(...(visibleTables.value.map(t => t.bytes)), 1))
</script>

<template>
  <div class="pg">
    <header class="hdr">
      <router-link to="/king" class="back">← King's Tower</router-link>
      <h1>DB Stats</h1>
    </header>

    <div v-if="loading" class="empty">로딩 중...</div>
    <div v-else-if="error" class="empty err">{{ error }}</div>
    <template v-else-if="data">

      <!-- KPI -->
      <div class="kpi">
        <div class="k">
          <div class="k-val">{{ fmt(data.totalPlayers) }}</div>
          <div class="k-lbl">Active Players</div>
        </div>
        <div class="k gold">
          <div class="k-val">{{ fmt(data.totalBattles) }}</div>
          <div class="k-lbl">Total Battles</div>
        </div>
        <div class="k">
          <div class="k-val">{{ fmtBytes(data.dbSizeBytes) }}</div>
          <div class="k-lbl">Database Size</div>
        </div>
      </div>

      <!-- Battle Types -->
      <section class="panel">
        <h2>Battle Types</h2>
        <div class="type-list">
          <div v-for="b in data.battleTypes" :key="b.type" class="type-row">
            <span class="type-name">{{ b.type }}</span>
            <span class="type-count">{{ fmt(b.count) }}</span>
          </div>
        </div>
      </section>

      <!-- Bracket Users -->
      <section class="panel">
        <h2>Trophy Arenas</h2>
        <div class="bk-list">
          <div v-for="b in trophyUsers" :key="b.bracket" class="bk-row">
            <span class="bk-name">{{ b.bracket }}</span>
            <div class="bk-bar-wrap">
              <div class="bk-bar gold-bar" :style="{ width: barWidth(b.count) }"></div>
            </div>
            <span class="bk-count">{{ fmt(b.count) }}</span>
          </div>
        </div>
      </section>

      <section class="panel">
        <h2>Path of Legends</h2>
        <div class="bk-list">
          <div v-for="b in polUsers" :key="b.bracket" class="bk-row">
            <span class="bk-name">{{ b.bracket }}</span>
            <div class="bk-bar-wrap">
              <div class="bk-bar gold-bar" :style="{ width: barWidth(b.count) }"></div>
            </div>
            <span class="bk-count">{{ fmt(b.count) }}</span>
          </div>
        </div>
      </section>

      <section class="panel" v-if="otherUsers.length">
        <h2>Other</h2>
        <div class="bk-list">
          <div v-for="b in otherUsers" :key="b.bracket" class="bk-row">
            <span class="bk-name">{{ b.bracket }}</span>
            <div class="bk-bar-wrap">
              <div class="bk-bar gold-bar" :style="{ width: barWidth(b.count) }"></div>
            </div>
            <span class="bk-count">{{ fmt(b.count) }}</span>
          </div>
        </div>
      </section>

      <!-- Table Sizes -->
      <section class="panel">
        <h2>Table Sizes</h2>
        <div class="tbl-list">
          <div v-for="t in visibleTables" :key="t.name" class="tbl-row">
            <span class="tbl-name">{{ t.name }}</span>
            <div class="tbl-bar-wrap">
              <div class="tbl-bar" :style="{ width: Math.max(2, t.bytes / maxTableBytes * 100) + '%' }"></div>
            </div>
            <span class="tbl-size">{{ fmtBytes(t.bytes) }}</span>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
.pg { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 3rem; }

.hdr { margin-bottom: 1.5rem; }
.back { font-size: var(--fs-sm); color: var(--text-muted); }
.back:hover { color: var(--gold); }
.hdr h1 { font-family: var(--font-display); font-size: var(--fs-2xl); color: var(--text); margin-top: .4rem; }

.empty { text-align: center; padding: 3rem; color: var(--text-dim); }
.empty.err { color: var(--loss); }

/* KPI */
.kpi { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-bottom: 1.25rem; }
.k { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem .8rem; text-align: center; }
.k.gold { border-color: var(--gold-dim); }
.k-val { font-family: var(--font-display); font-size: var(--fs-xl); font-weight: 700; color: var(--text); }
.k.gold .k-val { color: var(--gold); }
.k-lbl { font-size: var(--fs-sm); color: var(--text-dim); margin-top: .2rem; }

/* Panel */
.panel { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem 1.1rem; margin-bottom: .6rem; }
.panel h2 { font-family: var(--font-display); font-size: var(--fs-md); font-weight: 600; color: var(--text-sub); margin-bottom: .6rem; padding-bottom: .4rem; border-bottom: 1px solid var(--border); }

/* Battle Types */
.type-list { display: flex; flex-direction: column; gap: .15rem; }
.type-row { display: flex; align-items: center; justify-content: space-between; padding: .35rem .4rem; border-radius: var(--radius-sm); }
.type-row:hover { background: rgba(255,255,255,.02); }
.type-name { font-size: var(--fs-base); color: var(--text); }
.type-count { font-family: var(--font-display); font-size: var(--fs-base); color: var(--text-sub); }

/* Bracket bars */
.bk-list { display: flex; flex-direction: column; gap: .2rem; }
.bk-row { display: flex; align-items: center; gap: .6rem; padding: .25rem .4rem; }
.bk-row:hover { background: rgba(255,255,255,.02); border-radius: var(--radius-sm); }
.bk-name { font-family: var(--font-display); font-size: var(--fs-base); color: var(--text-dim); width: 6.5rem; flex-shrink: 0; }
.bk-bar-wrap { flex: 1; height: 6px; background: rgba(255,255,255,.04); border-radius: 3px; overflow: hidden; }
.bk-bar { height: 100%; border-radius: 3px; transition: width .4s ease; }
.gold-bar { background: var(--gold); }
.bk-count { font-family: var(--font-display); font-size: var(--fs-base); color: var(--text); width: 5.5rem; text-align: right; flex-shrink: 0; }

/* Table sizes */
.tbl-list { display: flex; flex-direction: column; gap: .2rem; }
.tbl-row { display: flex; align-items: center; gap: .6rem; padding: .25rem .4rem; }
.tbl-row:hover { background: rgba(255,255,255,.02); border-radius: var(--radius-sm); }
.tbl-name { font-family: var(--font-display); font-size: var(--fs-sm); color: var(--text); width: 14rem; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; }
.tbl-bar-wrap { flex: 1; height: 6px; background: rgba(255,255,255,.04); border-radius: 3px; overflow: hidden; }
.tbl-bar { height: 100%; border-radius: 3px; background: var(--text-dim); transition: width .4s ease; }
.tbl-size { font-family: var(--font-display); font-size: var(--fs-base); color: var(--text-sub); width: 5rem; text-align: right; flex-shrink: 0; }

@media (max-width: 640px) {
  .kpi { grid-template-columns: 1fr; }
  .bk-name { width: 5rem; }
  .tbl-name { width: 8rem; }
}
</style>

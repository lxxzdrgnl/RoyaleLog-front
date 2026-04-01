<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { fetchMonitor, fetchHistory, fetchExecution, type MonitorResponse, type JobResult, type ExecutionDetail } from '@/api/batch'

const activeTab = ref<'live' | 'history'>('live')

const data = ref<MonitorResponse | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)
let timer: ReturnType<typeof setInterval>

async function loadLive() {
  try { data.value = await fetchMonitor(); error.value = null }
  catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

const collectors = ref<JobResult[]>([])
const analyzers = ref<JobResult[]>([])
const historyLoading = ref(true)
const expandedId = ref<number | null>(null)
const detailCache = ref<Record<number, ExecutionDetail>>({})
const detailLoading = ref(false)

async function loadHistory() {
  historyLoading.value = true
  try {
    const [c, a] = await Promise.all([fetchHistory('battleLogCollectorJob'), fetchHistory('deckAnalyzerJob')])
    collectors.value = c ?? []; analyzers.value = a ?? []
  } catch {}
  finally { historyLoading.value = false }
}

async function toggleDetail(id: number) {
  if (expandedId.value === id) { expandedId.value = null; return }
  expandedId.value = id
  if (!detailCache.value[id]) {
    detailLoading.value = true
    try { detailCache.value[id] = await fetchExecution(id) } catch {}
    finally { detailLoading.value = false }
  }
}

function dur(s: string | null, e: string | null) {
  if (!s || !e) return '-'
  const sec = Math.floor((new Date(e).getTime() - new Date(s).getTime()) / 1000)
  return `${Math.floor(sec / 60)}분 ${sec % 60}초`
}

onMounted(() => { loadLive(); timer = setInterval(loadLive, 3000) })
onUnmounted(() => clearInterval(timer))

function switchTab(t: 'live' | 'history') {
  activeTab.value = t
  if (t === 'history' && !collectors.value.length) loadHistory()
}

const isRunning = computed(() => data.value?.status === 'STARTED')
const jobLabel = computed(() => {
  const m: Record<string, string> = { battleLogCollectorJob: 'Collector', deckAnalyzerJob: 'Analyzer', cardSyncJob: 'Card Sync' }
  return m[data.value?.jobName ?? ''] ?? '-'
})

const elapsed = computed(() => {
  if (!data.value?.startTime) return '-'
  const s = new Date(data.value.startTime).getTime()
  const e = data.value.endTime ? new Date(data.value.endTime).getTime() : Date.now()
  const sec = Math.floor((e - s) / 1000)
  return `${Math.floor(sec / 60)}분 ${sec % 60}초`
})

const mainStep = computed(() => {
  if (!data.value?.steps.length) return null
  return data.value.steps.find(s => s.status === 'STARTED') ?? data.value.steps[data.value.steps.length - 1]
})

const rate = computed(() => {
  if (!mainStep.value || !data.value?.startTime) return 0
  const s = new Date(data.value.startTime).getTime()
  const e = data.value.endTime ? new Date(data.value.endTime).getTime() : Date.now()
  const sec = (e - s) / 1000
  return sec > 0 ? Math.round(mainStep.value.read / sec) : 0
})

const totalBattles = computed(() => data.value?.brackets.reduce((s, b) => s + b.current, 0) ?? 0)
const trophyBrackets = computed(() => data.value?.brackets.filter(b => b.bracket.startsWith('arena_')) ?? [])
const polBrackets = computed(() => data.value?.brackets.filter(b => b.bracket.startsWith('pol_')) ?? [])
const specialBrackets = computed(() => data.value?.brackets.filter(b => b.bracket === 'special' || b.bracket === 'trophy_unknown') ?? [])

function pct(c: number, l: number) { return l <= 0 ? 100 : Math.min(100, Math.round((c / l) * 100)) }
function fmt(n: number) { return n.toLocaleString() }
function fmtTime(t: string | null) {
  if (!t) return '-'
  const d = new Date(t)
  return `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

function parseError(raw: string) {
  const m = raw.match(/Exception:\s*(.+?)(?:\n|\tat|$)/)
  if (m) return m[1].trim()
  const e = raw.match(/ERROR:\s*(.+?)(?:\n|$)/)
  if (e) return e[1].trim()
  return raw.substring(0, 150)
}
</script>

<template>
  <div class="pg">
    <header class="hdr">
      <router-link to="/king" class="back">← King's Tower</router-link>
      <div class="hdr-row">
        <h1>Batch Monitor</h1>
        <div class="tabs">
          <button class="tab" :class="{ on: activeTab === 'live' }" @click="switchTab('live')">Live</button>
          <button class="tab" :class="{ on: activeTab === 'history' }" @click="switchTab('history')">History</button>
        </div>
      </div>
    </header>

    <!-- ══ LIVE ══ -->
    <template v-if="activeTab === 'live'">
      <div v-if="loading" class="empty">로딩 중...</div>
      <div v-else-if="error" class="empty" style="color: var(--loss)">{{ error }}</div>
      <div v-else-if="!data" class="empty">실행 이력 없음</div>
      <template v-else>

        <div class="status-row">
          <span class="job-name">{{ jobLabel }}</span>
          <span v-if="isRunning" class="live-tag"><span class="live-dot"></span>LIVE</span>
          <span v-else class="st-tag" :class="data.status.toLowerCase()">{{ data.status }}</span>
        </div>

        <div class="kpi">
          <div class="k"><div class="k-val">{{ elapsed }}</div><div class="k-lbl">경과 시간</div></div>
          <div class="k gold"><div class="k-val">{{ rate }} <small>/초</small></div><div class="k-lbl">처리 속도</div></div>
          <div class="k" v-if="mainStep">
            <div class="k-val">{{ mainStep.totalTarget ? Math.round(mainStep.read / mainStep.totalTarget * 100) + '%' : fmt(mainStep.read) }}</div>
            <div class="k-lbl">{{ mainStep.totalTarget ? fmt(mainStep.read) + ' / ' + fmt(mainStep.totalTarget) : 'Read' }}</div>
          </div>
          <div class="k" v-if="data.brackets.length"><div class="k-val">{{ fmt(totalBattles) }}</div><div class="k-lbl">총 배틀</div></div>
          <div class="k" v-else-if="mainStep"><div class="k-val">{{ fmt(mainStep.write) }}</div><div class="k-lbl">Write</div></div>
        </div>

        <section class="panel">
          <h2>Pipeline</h2>
          <div class="steps">
            <div v-for="(s, i) in data.steps" :key="s.name" class="step" :class="s.status.toLowerCase()">
              <span class="step-name">{{ s.name.replace('Step', '') }}</span>
              <span v-if="s.read > 0" class="step-num">{{ fmt(s.read) }}<template v-if="s.totalTarget"> / {{ fmt(s.totalTarget) }}</template></span>
              <span class="st-tag sm" :class="s.status.toLowerCase()">{{ s.status }}</span>
            </div>
          </div>
        </section>

        <template v-if="data.brackets.length">
          <section class="panel" v-for="sec in [
            { title: 'Trophy Arenas', items: trophyBrackets },
            { title: 'Path of Legends', items: polBrackets },
            { title: 'Special & Other', items: specialBrackets }
          ]" :key="sec.title">
            <h2>{{ sec.title }}</h2>
            <table>
              <thead><tr><th>Bracket</th><th class="r">수집</th><th class="r">한도</th><th class="r">달성</th><th class="bar-col"></th></tr></thead>
              <tbody>
                <tr v-for="b in sec.items" :key="b.bracket" :class="{ done: pct(b.current, b.limit) >= 100 }">
                  <td>{{ b.bracket }}</td>
                  <td class="r mono">{{ fmt(b.current) }}</td>
                  <td class="r mono dim">{{ fmt(b.limit) }}</td>
                  <td class="r mono" :class="{ 'c-win': pct(b.current, b.limit) >= 100 }">{{ pct(b.current, b.limit) }}%</td>
                  <td class="bar-col"><div class="bar"><div class="bar-fill" :style="{ width: pct(b.current, b.limit) + '%' }"></div></div></td>
                </tr>
              </tbody>
            </table>
          </section>
        </template>
      </template>
    </template>

    <!-- ══ HISTORY ══ -->
    <template v-if="activeTab === 'history'">
      <div v-if="historyLoading" class="empty">로딩 중...</div>
      <template v-else>
        <section class="panel" v-for="grp in [
          { title: 'Collector', items: collectors },
          { title: 'Analyzer', items: analyzers }
        ]" :key="grp.title">
          <h2>{{ grp.title }}</h2>
          <div v-if="!grp.items.length" class="empty sm">이력 없음</div>
          <div v-else class="hist">
            <div v-for="j in grp.items" :key="j.executionId" class="hi" :class="{ open: expandedId === j.executionId }">
              <div class="hi-row" @click="toggleDetail(j.executionId)">
                <span class="hi-id">#{{ j.executionId }}</span>
                <span class="hi-date">{{ j.date }}</span>
                <span class="hi-time">{{ fmtTime(j.startTime) }}</span>
                <span class="st-tag sm" :class="j.status.toLowerCase()">{{ j.status }}</span>
                <span class="hi-chev">▾</span>
              </div>

              <div v-if="expandedId === j.executionId" class="hi-body">
                <div v-if="detailLoading" class="empty sm">로딩 중...</div>
                <template v-else-if="detailCache[j.executionId]">
                  <div class="hi-meta">
                    <span>소요: <b>{{ dur(detailCache[j.executionId].startTime, detailCache[j.executionId].endTime) }}</b></span>
                    <span>Exit: <b>{{ detailCache[j.executionId].exitCode }}</b></span>
                  </div>
                  <div class="hi-steps">
                    <div v-for="s in detailCache[j.executionId].steps" :key="s.stepName" class="hi-step">
                      <span class="hi-step-name">{{ s.stepName }}</span>
                      <span class="st-tag xs" :class="s.status.toLowerCase()">{{ s.status }}</span>
                      <span class="hi-step-nums" v-if="s.readCount > 0 || s.writeCount > 0">
                        R:<b>{{ fmt(s.readCount) }}</b> W:<b>{{ fmt(s.writeCount) }}</b>
                        <template v-if="s.skipCount > 0"> S:<b style="color:var(--loss)">{{ s.skipCount }}</b></template>
                      </span>
                    </div>
                  </div>
                  <div v-if="detailCache[j.executionId].bracketCounts" class="hi-bk">
                    <div class="hi-bk-hd">브라켓별 수집</div>
                    <div class="hi-bk-grid">
                      <div v-for="(cnt, brk) in detailCache[j.executionId].bracketCounts" :key="brk" class="hi-bk-item">
                        <span class="dim">{{ brk }}</span>
                        <span class="mono">{{ fmt(cnt) }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="detailCache[j.executionId].exitCode === 'FAILED' && detailCache[j.executionId].exitMessage" class="hi-err">
                    <b>실패 원인:</b> {{ parseError(detailCache[j.executionId].exitMessage) }}
                  </div>
                </template>
              </div>
            </div>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.pg { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 3rem; }

/* Header */
.hdr { margin-bottom: 1.5rem; }
.back { font-size: var(--fs-md); color: var(--text-muted); }
.back:hover { color: var(--gold); }
.hdr-row { display: flex; align-items: center; justify-content: space-between; margin-top: .4rem; }
.hdr-row h1 { font-family: var(--font-display); font-size: var(--fs-2xl); color: var(--text); }
.tabs { display: flex; gap: .25rem; }
.tab {
  font-family: var(--font-display); font-size: var(--fs-md); font-weight: 600;
  padding: .35rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: transparent; color: var(--text-dim); cursor: pointer; transition: all .2s;
}
.tab:hover { color: var(--text-sub); border-color: var(--text-muted); }
.tab.on { background: var(--gold); border-color: var(--gold); color: #000; }

/* Status */
.status-row { display: flex; align-items: center; gap: .6rem; margin-bottom: 1rem; }
.job-name { font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 600; color: var(--text-sub); }
.live-tag {
  display: inline-flex; align-items: center; gap: .3rem;
  font-family: var(--font-display); font-size: var(--fs-md); font-weight: 700;
  color: var(--win); padding: .2rem .6rem; border-radius: var(--radius-sm); background: rgba(46,204,113,.1);
}
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--win); animation: blink 1.4s infinite; }
@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:.3 } }

.st-tag {
  font-family: var(--font-display); font-size: var(--fs-md); font-weight: 700;
  padding: .2rem .6rem; border-radius: var(--radius-sm);
}
.st-tag.sm { font-size: var(--fs-sm); padding: .15rem .5rem; }
.st-tag.xs { font-size: var(--fs-xs); padding: .1rem .4rem; }
.st-tag.completed { background: rgba(46,204,113,.1); color: var(--win); }
.st-tag.started   { background: rgba(45,107,228,.1); color: var(--blue); }
.st-tag.failed    { background: rgba(231,76,60,.1); color: var(--loss); }

.empty { text-align: center; padding: 3rem; color: var(--text-dim); font-size: var(--fs-md); }
.empty.sm { padding: 1.5rem; }

/* KPI */
.kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; margin-bottom: 1.25rem; }
.k { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem .8rem; text-align: center; }
.k.gold { border-color: var(--gold-dim); }
.k-val { font-family: var(--font-display); font-size: var(--fs-xl); font-weight: 700; color: var(--text); }
.k.gold .k-val { color: var(--gold); }
.k-val small { font-size: .75em; color: var(--text-dim); font-weight: 400; }
.k-lbl { font-size: var(--fs-md); color: var(--text-dim); margin-top: .2rem; }

/* Panel */
.panel { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem 1.1rem; margin-bottom: .6rem; }
.panel h2 { font-family: var(--font-display); font-size: var(--fs-md); font-weight: 600; color: var(--text-sub); margin-bottom: .6rem; padding-bottom: .4rem; border-bottom: 1px solid var(--border); }

/* Steps */
.steps { display: flex; flex-direction: column; gap: .25rem; }
.step { display: flex; align-items: center; gap: .6rem; padding: .5rem .6rem; border: 1px solid transparent; }
.step.started { background: rgba(45,107,228,.04); border-color: rgba(45,107,228,.1); }
.step.completed { opacity: .6; }
.step-name { font-family: var(--font-display); font-size: var(--fs-md); color: var(--text); flex: 1; }
.step-num { font-family: var(--font-display); font-size: var(--fs-md); color: var(--text-dim); }

/* Table */
table { width: 100%; border-collapse: collapse; }
th, td { padding: .45rem .6rem; font-size: var(--fs-md); }
th { text-align: left; color: var(--text-dim); font-size: var(--fs-sm); font-weight: 600; border-bottom: 1px solid var(--border); }
td { border-bottom: 1px solid rgba(42,58,85,.3); color: var(--text); }
tr.done td { opacity: .4; }
.r { text-align: right; }
.mono { font-family: var(--font-display); }
.dim { color: var(--text-dim); }
.c-win { color: var(--win); font-weight: 700; }
.bar-col { width: 100px; }
.bar { height: 5px; background: rgba(255,255,255,.04); border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--gold); border-radius: 3px; transition: width .5s ease; }

/* History */
.hist { display: flex; flex-direction: column; gap: .2rem; }
.hi { border: 1px solid transparent; transition: border-color .2s; }
.hi.open { border-color: var(--border); }
.hi-row { display: flex; align-items: center; gap: .6rem; padding: .55rem .6rem; cursor: pointer; transition: background .15s; }
.hi-row:hover { background: rgba(255,255,255,.02); }
.hi-id { font-family: var(--font-display); font-size: var(--fs-md); color: var(--text-dim); width: 3.5rem; }
.hi-date { font-size: var(--fs-md); color: var(--text); flex: 1; }
.hi-time { font-family: var(--font-display); font-size: var(--fs-md); color: var(--text-dim); }
.hi-chev { color: var(--text-muted); transition: transform .2s; }
.hi.open .hi-chev { transform: rotate(180deg); }

.hi-body { padding: .7rem .8rem; border-top: 1px solid var(--border); }
.hi-meta { display: flex; gap: 1.5rem; font-size: var(--fs-md); color: var(--text-dim); margin-bottom: .6rem; }
.hi-meta b { color: var(--text-sub); font-family: var(--font-display); }

.hi-steps { display: flex; flex-direction: column; gap: .2rem; margin-bottom: .6rem; }
.hi-step { display: flex; align-items: center; gap: .5rem; padding: .3rem .4rem; }
.hi-step-name { font-family: var(--font-display); font-size: var(--fs-md); color: var(--text); flex: 1; }
.hi-step-nums { font-size: var(--fs-md); color: var(--text-dim); }
.hi-step-nums b { font-family: var(--font-display); color: var(--text-sub); }

.hi-bk { margin-top: .6rem; padding-top: .6rem; border-top: 1px solid var(--border); }
.hi-bk-hd { font-family: var(--font-display); font-size: var(--fs-md); color: var(--text-dim); margin-bottom: .4rem; }
.hi-bk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .2rem; }
.hi-bk-item { display: flex; justify-content: space-between; padding: .25rem .5rem; font-size: var(--fs-md); }
.hi-err { margin-top: .6rem; padding: .6rem .8rem; font-size: var(--fs-md); background: rgba(231,76,60,.05); border: 1px solid rgba(231,76,60,.12); }
.hi-err b { color: var(--loss); }

@media (max-width: 640px) {
  .kpi { grid-template-columns: repeat(2, 1fr); }
  .bar-col { width: 60px; }
  .hdr-row { flex-direction: column; align-items: flex-start; gap: .4rem; }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface JobResult {
  jobId: number
  executionId: number
  status: string
  date: string
  startTime: string | null
}

const collectors = ref<JobResult[]>([])
const analyzers = ref<JobResult[]>([])
const loading = ref(true)

async function fetchHistory(jobName: string): Promise<JobResult[]> {
  try {
    const res = await fetch(`/batch/history/${jobName}`)
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch { return [] }
}

onMounted(async () => {
  const [c, a] = await Promise.all([
    fetchHistory('battleLogCollectorJob'),
    fetchHistory('deckAnalyzerJob')
  ])
  collectors.value = c
  analyzers.value = a
  loading.value = false
})

function fmtTime(t: string | null) {
  if (!t) return '-'
  const d = new Date(t)
  return `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}
</script>

<template>
  <div class="hist">
    <header class="hdr">
      <router-link to="/king" class="back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        King's Tower
      </router-link>
      <h1>Batch History</h1>
    </header>

    <div v-if="loading" class="placeholder">로딩 중...</div>

    <template v-else>
      <section class="panel">
        <h2 class="panel-title">Collector Job</h2>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>날짜</th><th>시작</th><th>상태</th></tr></thead>
            <tbody>
              <tr v-for="j in collectors" :key="j.executionId" :class="j.status.toLowerCase()">
                <td class="num">{{ j.executionId }}</td>
                <td>{{ j.date }}</td>
                <td class="num">{{ fmtTime(j.startTime) }}</td>
                <td><span class="st" :class="j.status.toLowerCase()">{{ j.status }}</span></td>
              </tr>
              <tr v-if="!collectors.length"><td colspan="4" class="placeholder">이력 없음</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-title">Analyzer Job</h2>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>날짜</th><th>시작</th><th>상태</th></tr></thead>
            <tbody>
              <tr v-for="j in analyzers" :key="j.executionId" :class="j.status.toLowerCase()">
                <td class="num">{{ j.executionId }}</td>
                <td>{{ j.date }}</td>
                <td class="num">{{ fmtTime(j.startTime) }}</td>
                <td><span class="st" :class="j.status.toLowerCase()">{{ j.status }}</span></td>
              </tr>
              <tr v-if="!analyzers.length"><td colspan="4" class="placeholder">이력 없음</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.hist {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.hdr { margin-bottom: 1.5rem; }
.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--fs-xs);
  color: var(--text-muted);
  transition: color 0.2s;
  margin-bottom: 0.4rem;
}
.back:hover { color: var(--gold); }
.hdr h1 {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
}

.panel {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.1rem;
  margin-bottom: 1rem;
}
.panel-title {
  font-family: var(--font-display);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--text-sub);
  letter-spacing: 0.03em;
  margin-bottom: 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
}

.placeholder { text-align: center; padding: 2rem; color: var(--text-dim); }

.tbl-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.45rem 0.6rem; font-size: var(--fs-sm); }
th {
  text-align: left;
  color: var(--text-muted);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}
td { color: var(--text); border-bottom: 1px solid rgba(42,58,85,0.4); }
.num { font-family: var(--font-display); }

.st {
  font-family: var(--font-display);
  font-size: var(--fs-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-sm);
}
.st.completed { background: rgba(46,204,113,0.1); color: var(--win); }
.st.started   { background: rgba(45,107,228,0.12); color: var(--blue); }
.st.failed    { background: rgba(231,76,60,0.1); color: var(--loss); }
</style>

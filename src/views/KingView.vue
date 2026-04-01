<script setup lang="ts">
import { ref, onMounted } from 'vue'

const health = ref<{ api: string; batch: string }>({ api: 'LOADING', batch: 'LOADING' })

async function checkHealth() {
  try { health.value.api = (await fetch('/api-health')).ok ? 'UP' : 'DOWN' }
  catch { health.value.api = 'DOWN' }
  try { health.value.batch = (await fetch('/batch-health')).ok ? 'UP' : 'DOWN' }
  catch { health.value.batch = 'DOWN' }
}

onMounted(checkHealth)
</script>

<template>
  <div class="pg">
    <header class="hdr">
      <h1>King's Tower</h1>
      <p class="sub">RoyaleLog Control Center</p>
    </header>

    <section class="servers">
      <div class="srv" :class="health.api.toLowerCase()">
        <span class="srv-dot"></span>
        <span class="srv-name">API Server</span>
        <span class="srv-val">{{ health.api }}</span>
      </div>
      <div class="srv" :class="health.batch.toLowerCase()">
        <span class="srv-dot"></span>
        <span class="srv-name">Batch Server</span>
        <span class="srv-val">{{ health.batch }}</span>
      </div>
    </section>

    <nav class="menu">
      <router-link to="/king/batch" class="menu-item">
        <div>
          <div class="menu-title">Batch Monitor</div>
          <div class="menu-desc">실시간 진행률 · 브라켓 카운터 · 실행 이력</div>
        </div>
        <span class="menu-arrow">→</span>
      </router-link>
      <router-link to="/king/data" class="menu-item">
        <div>
          <div class="menu-title">DB Stats</div>
          <div class="menu-desc">유저 · 배틀 · 테이블 용량 · 브라켓별 현황</div>
        </div>
        <span class="menu-arrow">→</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.pg {
  max-width: 640px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.hdr {
  margin-bottom: 2rem;
}
.hdr h1 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gold);
}
.sub {
  font-size: var(--fs-base);
  color: var(--text-dim);
  margin-top: .25rem;
}

/* 서버 상태 */
.servers {
  display: flex;
  gap: .5rem;
  margin-bottom: 2rem;
}
.srv {
  flex: 1;
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.srv-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-dim);
}
.srv.up .srv-dot { background: var(--win); }
.srv.down .srv-dot { background: var(--loss); }
.srv-name {
  font-size: var(--fs-md);
  color: var(--text);
  flex: 1;
}
.srv-val {
  font-family: var(--font-display);
  font-size: var(--fs-base);
  color: var(--text-dim);
}

/* 메뉴 */
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.2rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color .2s;
}
.menu-item:hover {
  border-color: var(--gold-dim);
}
.menu-title {
  font-family: var(--font-display);
  font-size: var(--fs-xl);
  font-weight: 600;
  color: var(--text);
}
.menu-desc {
  font-size: var(--fs-base);
  color: var(--text-dim);
  margin-top: .15rem;
}
.menu-arrow {
  font-size: var(--fs-lg);
  color: var(--text-muted);
  transition: color .2s;
}
.menu-item:hover .menu-arrow { color: var(--gold); }

@media (max-width: 640px) {
  .servers { flex-direction: column; }
}
</style>
